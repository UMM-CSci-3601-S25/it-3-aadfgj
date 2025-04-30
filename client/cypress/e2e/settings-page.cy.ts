import { SettingsPage } from '../support/settings-page.po';

const page = new SettingsPage();

describe('Settings page', () => {

  before(() => {
    cy.task('seed:database');
  });

  beforeEach(() => {
    page.navigateTo();
  });

  // test parts of settings page
  it('Should look at the url and check if it\'s correct', () => {
    cy.url().should(url => expect(url.endsWith('/settings/123456789')).to.be.true);
  });

  it('Should start game', () => {
    page.startGame().click();
    cy.url().should(url => expect(url.includes('')).to.be.true);
  });
  // add test for checking if you can copy the game code

  // should test for if you can add custom number of rounds
});
