import test from "node:test";
import { Client } from "undici";

/**
 * Test for the event route
 * As per fastify documentation: https://fastify.dev/docs/v1.14.x/Documentation/Testing/
*/

const baseUrl = "/api/v1/subscriptions"
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
 * Test for add an subscription
 */
test("Should POST to /subscriptions", async t => {
  t.plan(2);

  const response = await client.request({
    method: 'POST',
    path: baseUrl,
    body: JSON.stringify({
      firstName: "test",
      lastName: "user",
      email: "testuser@gmail.com",
    }),
    headers: {
      "Content-Type": "application/json"
    }
  });

  const responseData: any = await response.body.json();
  t.assert.equal(response.statusCode, 201);
  t.assert.equal(responseData.success, true);
  idToDelete = responseData.data._id.toString();
})

/**
 * Test for get an subscription
 */
test("Should GET from /subscriptions", async t => {
  t.plan(4);

  const response = await client.request({
    method: 'GET',
    path: `${baseUrl}/${idToDelete}`,
  });

  const responseData: any = await response.body.json();
  t.assert.equal(response.statusCode, 200);
  t.assert.equal(responseData.success, true);
  t.assert.equal(responseData.data.firstName, "test")
  t.assert.equal(responseData.data.lastName, "user")
})

/**
 * Test for get all subscription
 */
test("Should GET all from /subscriptions", async t => {
  t.plan(3);

  const response = await client.request({
    method: 'GET',
    path: baseUrl,
  });

  const responseData: any = await response.body.json();
  t.assert.equal(response.statusCode, 200);
  t.assert.equal(responseData.success, true);
  t.assert.equal(responseData.data.length, 3)
})

/**
 * Test for delete an subscription
 */
test("Should DELETE from /subscriptions", async t => {
  t.plan(3);

  const response = await client.request({
    method: 'DELETE',
    path: `${baseUrl}/${idToDelete}`,
  });

  const responseData: any = await response.body.json();
  t.assert.equal(response.statusCode, 200);
  t.assert.equal(responseData.success, true);
  t.assert.equal(responseData.data, "Subscription deleted")
})