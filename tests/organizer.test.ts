import test from "node:test";
import { Client } from "undici";

/**
 * Test for the event route
 * As per fastify documentation: https://fastify.dev/docs/v1.14.x/Documentation/Testing/
*/

const baseUrl = "/api/v1/organizers"
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
 * Test for add an organizer
 */
test("Should POST to /organizers", async t => {
  t.plan(2);

  const response = await client.request({
    method: 'POST',
    path: baseUrl,
    body: JSON.stringify({
      name: "An organizer 2",
      logo: "https://res.cloudinary.com/dw1wmzgy1/image/upload/v1733239467/samples/smile.jpg",
    }
    ),
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
 * Test for get an organizer
 */
test("Should GET from /organizers", async t => {
  t.plan(3);

  const response = await client.request({
    method: 'GET',
    path: `${baseUrl}/${idToDelete}`,
  });

  const responseData: any = await response.body.json();
  t.assert.equal(response.statusCode, 200);
  t.assert.equal(responseData.success, true);
  t.assert.equal(responseData.data.name, "An organizer 2");
})

/**
 * Test for get all organizer
 */
test("Should GET all from /organizers", async t => {
  t.plan(3);

  const response = await client.request({
    method: 'GET',
    path: `${baseUrl}`,
  });

  const responseData: any = await response.body.json();
  t.assert.equal(response.statusCode, 200);
  t.assert.equal(responseData.success, true);
  t.assert.equal(responseData.data.length, 3);
})

/**
 * Test for PUT an organizer
 */
test("Should PUT to /organizers", async t => {
  t.plan(3);

  const response = await client.request({
    method: 'PUT',
    path: `${baseUrl}`,
    body: JSON.stringify({
      id: idToDelete,
      name: "An Organizer updated",
    }),
    headers: {
      "Content-Type": "application/json"
    }
  });

  const responseData: any = await response.body.json();
  t.assert.equal(response.statusCode, 200);
  t.assert.equal(responseData.success, true);
  t.assert.equal(responseData.data.name, "An Organizer updated");
})


/**
 * Test for delete an organizer
 */
test("Should DELETE from /organizers", async t => {
  t.plan(3);

  const response = await client.request({
    method: 'DELETE',
    path: `${baseUrl}/${idToDelete}`,
  });

  const responseData: any = await response.body.json();
  t.assert.equal(response.statusCode, 200);
  t.assert.equal(responseData.success, true);
  t.assert.equal(responseData.data, "deleted susccessfuly");
})
