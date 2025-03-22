import test from "node:test";
import { Client } from "undici";

/**
 * Test for the about us route
 * As per fastify documentation: https://fastify.dev/docs/v1.14.x/Documentation/Testing/
*/

const baseUrl = "/api/v1/contact-us"
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
 * Should add a new contact us inquiry
 */
test("Should POST to /contact-us", async t => {
  t.plan(2);

  const response = await client.request({
    method: 'POST',
    path: baseUrl,
    body: JSON.stringify({
      firstName: "Chigozie",
      lastName: "Muonagolu",
      subject: "Potential colaboration.",
      company: "",
      email: "cmuonagolu18@gmail.com",
      phone: "6472251047",
      message: "Chigozie Chigozie Chigozie Chigozie Chigozie Chigozie Chigozie Chigozie Chigozie Chigozie Chigozie Chigozie Chigozie Chigozie Chigozie",
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
 * Should get a contact us inquiry
 */
test("Should GET from /contact-us", async t => {
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
 * Should get all a contact us inquiry
 */
test("Should GET all from /contact-us", async t => {
  t.plan(3);

  const response = await client.request({
    method: 'GET',
    path: `${baseUrl}`,
  });

  const responseData: any = await response.body.json();
  t.assert.equal(response.statusCode, 200);
  t.assert.equal(responseData.success, true);
  t.assert.equal(responseData.data.length, 6);
});

/**
 * Should delete a contact us inquiry
 */
test("Should DELETE to /contact-us", async t => {
  const response = await client.request({
    method: 'DELETE',
    path: `${baseUrl}/${idToDelete}`,
  });

  const responseData: any = await response.body.json();
  t.assert.equal(response.statusCode, 200);
  t.assert.equal(responseData.success, true);
  t.assert.equal(responseData.data, "Deleted successfuly");
});

