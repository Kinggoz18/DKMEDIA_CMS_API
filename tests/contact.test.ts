import test from "node:test";
import { Client } from "undici";

/**
 * Test for the contact route
 * As per fastify documentation: https://fastify.dev/docs/v1.14.x/Documentation/Testing/
*/

const baseUrl = "/api/v1/contact"
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
 * Test for update contact route
 */
test("Should POST to /contact route", async t => {
  t.plan(2);

  const response = await client.request({
    method: 'POST',
    path: baseUrl,
    body: JSON.stringify({
      email: "csasesa8@gmail.com",
      instagramLink: "https://www.instagram.com/dkmediahg/",
      tiktokLink: "https://www.tiktok.com/@dkmediahg",
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
 * Test for get contact route
 */
test("Should GET to /contact route", async t => {
  t.plan(3);

  const response = await client.request({
    method: 'GET',
    path: baseUrl,
  })

  const responseData: any = await response.body.json();
  t.assert.equal(response.statusCode, 200);
  t.assert.equal(responseData.success, true)
  t.assert.equal(responseData.data.email, "csasesa8@gmail.com")
})

/**
 * Test for delete contact route
 */
test("Should DELETE to /contact route", async t => {
  t.plan(2);

  const response = await client.request({
    method: 'DELETE',
    path: baseUrl,
  })

  const responseData: any = await response.body.json();

  t.assert.equal(response.statusCode, 200);
  t.assert.equal(responseData.data, "Deleted successfuly")
})





