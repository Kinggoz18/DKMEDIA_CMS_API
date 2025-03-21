import test from "node:test";
import { Client } from "undici";

/**
 * Test for the about us route
 * As per fastify documentation: https://fastify.dev/docs/v1.14.x/Documentation/Testing/
*/

const baseUrl = "/api/v1/articles"
let client: Client;
let idToDelete: String;

test.beforeEach(() => {
  client = new Client('http://localhost:4000', {
    keepAliveTimeout: 10,
    keepAliveMaxTimeout: 10
  })
})

test.after(() => {
  client.close();
})

/**
 * Should add a new article
 */
test("Should POST to /articles", async t => {
  t.plan(2);

  const response = await client.request({
    method: 'POST',
    path: baseUrl,
    body: JSON.stringify({
      title: "Exploring Life & Business with Isaac Owolabi of Dkmedia305",
      link: "https://voyagehouston.com/interview/exploring-life-business-with-isaac-owolabi-of-dkmedia305/",
    }),
    headers: {
      "Content-Type": "application/json"
    }
  });

  const responseData: any = await response.body.json();
  t.assert.equal(response.statusCode, 201);
  t.assert.equal(responseData.success, true);
  idToDelete = responseData.data._id.toString();
});

/**
 * Should get an article
 */
test("Should GET from /articles", async t => {
  t.plan(2);

  const response = await client.request({
    method: 'GET',
    path: `${baseUrl}/${idToDelete}`,
  });

  const responseData: any = await response.body.json();
  t.assert.equal(response.statusCode, 200);
  t.assert.equal(responseData.success, true);
});

/**
 * Should get all article
 */
test("Should GET all from /articles", async t => {
  t.plan(3);

  const response = await client.request({
    method: 'GET',
    path: `${baseUrl}`,
  });

  const responseData: any = await response.body.json();
  t.assert.equal(response.statusCode, 200);
  t.assert.equal(responseData.success, true);
  t.assert.equal(responseData.data.length, 5);
});

/**
 * Should delete an article
 */
test("Should DELETE to /articles", async t => {
  const response = await client.request({
    method: 'DELETE',
    path: `${baseUrl}/${idToDelete}`,
  });

  const responseData: any = await response.body.json();
  t.assert.equal(response.statusCode, 200);
  t.assert.equal(responseData.success, true);
  t.assert.equal(responseData.data, "Deleted successfuly");
});

