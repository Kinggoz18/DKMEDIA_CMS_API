import test from "node:test";
import { Client } from "undici";

/**
 * Test for the event route
 * As per fastify documentation: https://fastify.dev/docs/v1.14.x/Documentation/Testing/
*/

const baseUrl = "/api/v1/events"
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
 * Test to post an event
 */
test("Should POST to /event", async t => {
  t.plan(2);

  const response = await client.request({
    method: 'POST',
    path: baseUrl,
    body: JSON.stringify({
      title: "A test 3",
      date: "2016-05-18",
      image: "https://res.cloudinary.com/dw1wmzgy1/image/upload/v1733239467/samples/smile.jpg",
      priority: "Highlight",
      organizer: {
        name: "An organizer",
        logo: "https://res.cloudinary.com/dw1wmzgy1/image/upload/v1733239467/samples/smile.jpg",
        _id: "67bbd3d8a2c68549981e14d9"
      }
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
 * Test to get an event
 */
test("Should GET from /event", async t => {
  t.plan(3);

  const response = await client.request({
    method: 'GET',
    path: `${baseUrl}/${idToDelete}`,
  });

  const responseData: any = await response.body.json();
  t.assert.equal(response.statusCode, 200);
  t.assert.equal(responseData.success, true);
  t.assert.equal(responseData.data.title, "A test 3")
})

/**
 * Test to get an event
 */
test("Should GET all from /event", async t => {
  t.plan(3);

  const response = await client.request({
    method: 'GET',
    path: `${baseUrl}`,
  });

  const responseData: any = await response.body.json();
  t.assert.equal(response.statusCode, 200);
  t.assert.equal(responseData.success, true);
  t.assert.equal(responseData.data.length, 4)
})

/**
 * Test to update an event
 */
test("Should PUT to /event", async t => {
  t.plan(5);

  const response = await client.request({
    method: 'PUT',
    path: `${baseUrl}`,
    body: JSON.stringify({
      id: idToDelete,
      title: "A test 4",
      priority: "Regular",
      organizer: {
        name: "An organizer 2",
        logo: "https://res.cloudinary.com/dw1wmzgy1/image/upload/v1733239467/samples/smile.jpg",
        _id: "67bbd3d8a2c68549981e14d9"
      }
    }),
    headers: {
      "Content-Type": "application/json"
    }
  });

  const responseData: any = await response.body.json();
  t.assert.equal(response.statusCode, 200);
  t.assert.equal(responseData.success, true);
  t.assert.equal(responseData.data.title, "A test 4");
  t.assert.equal(responseData.data.priority, "Regular")
  t.assert.equal(responseData.data.organizer.name, "An organizer 2")
})

/**
 * Test for delete an route
 */
test("Should DELETE to /about-us route", async t => {
  t.plan(3);

  const response = await client.request({
    method: 'DELETE',
    path: `${baseUrl}/${idToDelete}`,
  })

  const responseData: any = await response.body.json();

  t.assert.equal(response.statusCode, 200);
  t.assert.equal(responseData.data, "event deleted")
  t.assert.equal(responseData.success, true)
})
