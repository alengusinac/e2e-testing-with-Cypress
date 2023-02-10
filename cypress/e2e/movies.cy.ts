import { isTypedArray } from 'cypress/types/lodash';

beforeEach(() => {
  cy.visit('/');
});

describe('test movieApp', () => {
  it('should be able to type in input', () => {
    cy.get('#searchText').type('matrix').should('have.value', 'matrix');
  });

  it('should be able to click button', () => {
    // arrange

    // act
    cy.get('#search').click();

    // assert
    cy.get('#movie-container')
      .children()
      .should('have.length', 1)
      .and('contain', 'Inga sökresultat');
  });

  it('should get data from API', () => {
    // arrange
    cy.intercept('GET', 'http://omdbapi.com/*').as('getMovies');
    cy.get('#searchText').type('matrix').should('have.value', 'matrix');

    // act
    cy.get('#search').click();

    // assert
    cy.wait('@getMovies').its('request.url').should('include', 'matrix');
    cy.get('#movie-container > :nth-child(1) > h3').should(
      'contain',
      'The Matrix'
    );
  });

  it('should get data from mockAPI', () => {
    // arrange
    cy.intercept('GET', 'http://omdbapi.com/*', { fixture: 'moviesOK' }).as(
      'getMovies'
    );
    cy.get('#searchText').type('matrix').should('have.value', 'matrix');

    // act
    cy.get('#search').click();

    // assert
    cy.wait('@getMovies').its('request.url').should('include', 'matrix');
    cy.get('@getMovies').its('request.method').should('equal', 'GET');
    cy.get('@getMovies')
      .its('response.body')
      .should('have.property', 'Response', 'True');
    cy.get('#movie-container > :nth-child(1) > h3').should('contain', 'Test 1');
    cy.get('#movie-container > :nth-child(1) > img').should('exist');
    cy.get('#movie-container > :nth-child(2) > h3').should(
      'contain',
      'The Matrix Reloaded'
    );
    cy.get('#movie-container > :nth-child(2) > img').should('exist');
  });

  it('should not get data from mockAPI(ErrorNotFound)', () => {
    // arrange
    cy.intercept('GET', 'http://omdbapi.com/*', {
      fixture: 'moviesErrorNotFound',
    }).as('getMovies');
    cy.get('#searchText')
      .type('matrixmatrixmatrixmatrixmatrix')
      .should('have.value', 'matrixmatrixmatrixmatrixmatrix');

    // act
    cy.get('#search').click();

    // assert
    cy.wait('@getMovies')
      .its('request.url')
      .should('include', 'matrixmatrixmatrixmatrixmatrix');
    cy.get('@getMovies').its('request.method').should('equal', 'GET');
    cy.get('@getMovies')
      .its('response.body')
      .should('have.property', 'Response', 'False');
    cy.get('@getMovies')
      .its('response.body')
      .should('have.property', 'Error', 'Movie not found!');
    cy.get('#movie-container')
      .children()
      .should('have.length', 1)
      .and('contain', 'Inga sökresultat');
  });

  it('should not get data from mockAPI(ErrorTooMany)', () => {
    // arrange
    cy.intercept('GET', 'http://omdbapi.com/*', {
      fixture: 'moviesErrorTooMany',
    }).as('getMovies');
    cy.get('#searchText').type('m').should('have.value', 'm');

    // act
    cy.get('#search').click();

    // assert
    cy.wait('@getMovies').its('request.url').should('include', 'm');
    cy.get('@getMovies').its('request.method').should('equal', 'GET');
    cy.get('@getMovies')
      .its('response.body')
      .should('have.property', 'Response', 'False');
    cy.get('@getMovies')
      .its('response.body')
      .should('have.property', 'Error', 'Too many results.');
    cy.get('#movie-container')
      .children()
      .should('have.length', 1)
      .and('contain', 'Inga sökresultat');
  });

  it('should not get data from mockAPI(ErrorBlocked)', () => {
    // arrange
    cy.intercept('GET', 'http://omdbapi.com/*', {
      fixture: 'moviesErrorBlocked',
    }).as('getMovies');
    cy.get('#searchText')
      .type('<script>Not hacking you bro</script>')
      .should('have.value', '<script>Not hacking you bro</script>');

    // act
    cy.get('#search').click();

    // assert
    cy.get('#movie-container')
      .children()
      .should('have.length', 1)
      .and('contain', 'Inga sökresultat');
  });
});
