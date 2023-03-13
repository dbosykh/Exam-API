import { faker } from '@faker-js/faker';
import { expect } from 'chai';
import * as post from '../fixtures/post.json'
import * as user from '../fixtures/user.json'

post.userId = parseInt(faker.random.numeric(5))
post.id = parseInt(faker.random.numeric(5))
post.title = faker.random.words(5)
post.body = faker.random.words(10)

user.id = post.userId
user.email = faker.internet.email()
user.password = faker.internet.password()

describe('Post suite', () => {

  it("Posts retrieving", () => {
    cy.log('Retrieving posts');
    cy.request('/posts').then(response => {
      console.log(response);
      expect(response.status).to.be.equal(200);
      expect(response.statusText).to.be.equal('OK');
      expect(response.isOkStatusCode).to.be.true;
    })
      .its('headers')
      .its('content-type')
      .should('include', 'application/json')
  })

  it('Retrieving first 10 posts', () => {
    cy.log('Retrieving posts');
    cy.request('/posts?_limit=10').then(response => {
      console.log(response);
      expect(response.status).to.be.equal(200);
      expect(response.statusText).to.be.equal('OK');
      expect(response.isOkStatusCode).to.be.true;

      expect(response.body[0].id).to.be.equal(1)
      expect(response.body[9].id).to.be.equal(10)
    })
  })

  it('Retrieving posts with id 55, 60', () => {
    cy.log('Retrieving posts');
    cy.request('/posts?id=55&id=60').then(response => {
      console.log(response);
      expect(response.status).to.be.equal(200);
      expect(response.statusText).to.be.equal('OK');
      expect(response.isOkStatusCode).to.be.true;

      expect(response.body[0].id).to.be.equal(55)
      expect(response.body[1].id).to.be.equal(60)
    })
  })

  it('Post creation unauthorized', () => {
    cy.log('Create post');
    cy.request({
      method: 'POST',
      url: '/664/posts',
      headers: {
        'Content-Type': 'application/json'
      },
      body: post,
      failOnStatusCode: false
    })
      .then(response => {
        console.log(response);
        expect(response.status).to.be.equal(401);
        expect(response.statusText).to.be.equal('Unauthorized');
      })
  })

  it('Post creation with token', () => {
    cy.log('Register');
    cy.request({
      method: 'POST',
      url: '/register',
      body: {
        "email": user.email,
        "password": user.password
      }
    })
      .then(response => {
        console.log(response);
        expect(response.status).to.be.equal(201);
        expect(response.statusText).to.be.equal('Created');
      })
    cy.log('Login');
    cy.request({
      method: 'POST',
      url: '/login',
      body: {
        "email": user.email,
        "password": user.password
      }
    })
      .then(response => {
        expect(response.status).to.be.equal(200);
        expect(response.statusText).to.be.equal('OK');
        cy.log('Creating post')
        cy.request({
          method: 'POST',
          url: '/664/posts',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${response.body.accessToken}`
          },
          body: post
        })
          .then(response => {
            expect(response.status).to.be.equal(201);
            expect(response.statusText).to.be.equal('Created');
          })
      })
    cy.request('GET', `/posts/${post.id}`).then(response => {
      expect(response.status).to.be.equal(200);
      expect(response.statusText).to.be.equal('OK');
      expect(response.isOkStatusCode).to.be.true;
      expect(response.body.id).to.be.equal(post.id)
    })
  })

  it('Create post entity', () => {
    cy.log('Create post entity');
    cy.request({
      method: 'POST',
      url: '/posts',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        "userId": user.id,
        "id": post.id,
        "title": post.title,
        "body": post.body
      }
    })
      .then(response => {
        expect(response.status).to.be.equal(201);
        expect(response.statusText).to.be.equal('Created');
      })
    cy.request('GET', `/posts/${post.id}`).then(response => {
      expect(response.status).to.be.equal(200);
      expect(response.statusText).to.be.equal('OK');
      expect(response.isOkStatusCode).to.be.true;
      expect(response.body.id).to.be.equal(post.id)
      expect(response.body.title).to.be.equal(post.title)
      expect(response.body.body).to.be.equal(post.body)
      expect(response.body.userId).to.be.equal(user.id)
    })
  })

  it('Update non-existing entity', () => {
    cy.log('Update entity');
    cy.request({
      method: 'PUT',
      url: '/posts',
      headers: {
        'Content-Type': 'application/json'
      },
      failOnStatusCode: false,
      body: {
        "userId": user.id,
        "id": post.id,
        "title": post.title,
        "body": post.body
      }
    })
      .then(response => {
        expect(response.status).to.be.equal(404);
        expect(response.statusText).to.be.equal('Not Found');
      })
  })

  it('Create, Update post entity', () => {
    cy.log('Create post entity');
    cy.request({
      method: 'POST',
      url: '/posts',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        "userId": user.id,
        "id": post.id,
        "title": post.title,
        "body": post.body
      }
    })
      .then(response => {
        expect(response.status).to.be.equal(201);
        expect(response.statusText).to.be.equal('Created');
      })
    cy.log('Update post entity');
    cy.request({
      method: 'PUT',
      url: `/posts/${post.id}`,
      headers: {
        'Content-Type': 'application/json'
      },
      form: true,
      body: {
        "title": post.title,
      }
    })
      .then(response => {
        expect(response.status).to.be.equal(200);
        expect(response.statusText).to.be.equal('OK');
      })
    cy.request('GET', `/posts/${post.id}`).then(response => {
      expect(response.status).to.be.equal(200);
      expect(response.statusText).to.be.equal('OK');
      expect(response.isOkStatusCode).to.be.true;
      expect(response.body.title).to.be.equal(post.title)
    })
  })

  it('Delete non-existing post entity', () => {
    cy.log('Delete post entity');
    cy.request({
      method: 'DELETE',
      url: '/posts',
      failOnStatusCode: false,
      body: {
        "userId": user.id,
        "id": post.id,
        "title": post.title,
        "body": post.body
      }
    })
      .then(response => {
        expect(response.status).to.be.equal(404);
        expect(response.statusText).to.be.equal('Not Found');
      })
  })

  it('Create, Update, Delete post entity', () => {
    cy.log('Create post entity');
    cy.request({
      method: 'POST',
      url: '/posts',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        "userId": user.id,
        "id": post.id,
        "title": post.title,
        "body": post.body
      }
    })
      .then(response => {
        expect(response.status).to.be.equal(201);
        expect(response.statusText).to.be.equal('Created');
      })
    cy.log('Update post entity');
    cy.request({
      method: 'PUT',
      url: `/posts/${post.id}`,
      headers: {
        'Content-Type': 'application/json'
      },
      form: true,
      body: {
        "body": post.body,
      }
    })
      .then(response => {
        expect(response.status).to.be.equal(200);
        expect(response.statusText).to.be.equal('OK');
        expect(response.body.body).to.be.equal(post.body)
      })
    cy.log('Delete post entity');
    cy.request({
      method: 'DELETE',
      url: `/posts/${post.id}`,
    })
      .then(response => {
        expect(response.status).to.be.equal(200);
        expect(response.statusText).to.be.equal('OK');
      })
    cy.request({
      method: 'GET',
      url: `/posts/${post.id}`,
      failOnStatusCode: false
    })
      .then(response => {
        expect(response.status).to.be.equal(404);
        expect(response.statusText).to.be.equal('Not Found');
      })
  })
})
