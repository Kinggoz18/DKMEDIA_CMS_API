import test from "node:test";
import { Client } from "undici";

/**
 * Test for the about us route
 * As per fastify documentation: https://fastify.dev/docs/v1.14.x/Documentation/Testing/
*/

const baseUrl = "/api/v1/about-us"
let client: Client;

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
 * Test for update about us route
 */
test("Should POST to /about-us route", async t => {
  t.plan(2);

  const response = await client.request({
    method: 'POST',
    path: baseUrl,
    body: JSON.stringify({
      title: "DkMedia about us",
      paragraphs: ["Edited first paragraph", "Added second paragraph"]
    }),
    headers: {
      "Content-Type": "application/json"
    }
  })

  const responseData: any = await response.body.json();

  t.assert.equal(response.statusCode, 200);
  t.assert.equal(responseData.success, true)
});


/**
 * Test for get about us route
 */
test("Should GET to /about-us route", async t => {
  t.plan(3);

  const response = await client.request({
    method: 'GET',
    path: baseUrl,
  })

  const responseData: any = await response.body.json();
  t.assert.equal(response.statusCode, 200);
  t.assert.equal(responseData.success, true)
  t.assert.equal(responseData.data.paragraphs.length, 2)
})

/**
 * Test for delete about us route
 */
test("Should DELETE to /about-us route", async t => {
  t.plan(2);

  const response = await client.request({
    method: 'DELETE',
    path: baseUrl,
  })

  const responseData: any = await response.body.json();

  t.assert.equal(response.statusCode, 200);
  t.assert.equal(responseData.data, "Deleted about us")
})





