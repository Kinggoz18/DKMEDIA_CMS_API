import test from "node:test";
import { Client } from "undici";

/**
 * Test for the event route
 * As per fastify documentation: https://fastify.dev/docs/v1.14.x/Documentation/Testing/
*/

const baseUrl = "/api/v1/upload-media"
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
 * Test for add an uploaded media
 */
test("Should POST to /upload-media", async t => {
  t.plan(2)

  const response = await client.request({
    method: 'POST',
    path: baseUrl,
    body: JSON.stringify({
      mediaType: "Image",
      mediaLink: "https://res.cloudinary.com/dw1wmzgy1/image/upload/v1733239467/samples/smile.jpg"
    }),
    headers: {
      "Content-Type": "application/json"
    }
  })

  const responseData: any = await response.body.json();
  t.assert.equal(response.statusCode, 201);
  t.assert.equal(responseData.success, true);
  idToDelete = responseData.data._id.toString();
})

/**
 * Test for get an uploaded media
 */
test("Should GET from /upload-media", async t => {
  t.plan(3)

  const response = await client.request({
    method: 'GET',
    path: `${baseUrl}/${idToDelete}`,
  })

  const responseData: any = await response.body.json();
  t.assert.equal(response.statusCode, 200);
  t.assert.equal(responseData.success, true);
  t.assert.equal(responseData.data.mediaType, "Image");
})

/**
 * Test for get all uploaded media
 */
test("Should GET all from /upload-media", async t => {
  t.plan(3)

  const response = await client.request({
    method: 'GET',
    path: `${baseUrl}`,
  })

  const responseData: any = await response.body.json();
  t.assert.equal(response.statusCode, 200);
  t.assert.equal(responseData.success, true);
  t.assert.equal(responseData.data.length, 4);
})

/**
 * Test for delete an uploaded media
 */
test("Should DELETE from /upload-media", async t => {
  t.plan(3)

  const response = await client.request({
    method: 'DELETE',
    path: `${baseUrl}/${idToDelete}`,
  })

  const responseData: any = await response.body.json();
  t.assert.equal(response.statusCode, 200);
  t.assert.equal(responseData.success, true);
  t.assert.equal(responseData.data, "deleted successfuly")
})