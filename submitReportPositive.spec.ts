import { faker } from "@faker-js/faker";
import { test, expect } from "@playwright/test";
import { addressDetails, login } from "../../playwright/auth";
import { writeFileSync, readFileSync, unlinkSync } from "fs";
import { submitReport } from "../../playwright/report";

const name = faker.address.street();
const text = faker.word.verb();

test.describe("submit file, new file", async () => {
  let _responseSubmit: any;
  let _responseJson: any;
  let _responseSubmitJson: any;
  let start: any;
  let end: any;

  test.beforeAll(async ({ request, baseURL }) => {
    _responseJson = await login({ request, baseURL });
    writeFileSync(`./playwright/attachments/${name}.pdf`, `${text}`);
    const file = readFileSync(`./playwright/attachments/${name}.pdf`);

    start = new Date();
    _responseSubmit = await request.post(`${baseURL}/api/Report/v2/request`, {
      headers: {
        Authorization: `Bearer ${_responseJson.accessToken}`,
      },
      multipart: {
        file: {
          name: `./playwright/attachments/${name}.pdf`,
          mimeType: "application/octet-stream",
          buffer: file,
        },
        address1: String(addressDetails[2]).split(",")[0],
        city: "Annapolis",
        state: "MD",
        zip: 21401,
        longtitude: addressDetails[0],
        latitude: addressDetails[1],
      },
    });
    end = new Date();

    _responseSubmitJson = await _responseSubmit.json();
  });

  test.afterAll(async () => {
    unlinkSync(`./playwright/attachments/${name}.pdf`);
  });

  test("response time should be less than 5000s", async () => {
    expect(end - start).toBeLessThan(5000);
  });

  test("status should equal 200", async () => {
    expect(_responseSubmit.status()).toBe(200);
  });

  test("response body should be an object", async () => {
    expect(typeof _responseSubmitJson).toBe("object");
  });

  test("check response headers", async () => {
    const headers = _responseSubmit.headers();
    expect(Object.keys(headers)).toContain("content-type");
    expect(headers["content-type"]).toContain("application/json");
  });

  test("check response props", async () => {
    const props = Object.keys(_responseSubmitJson);
    expect(props).toContain("requestId");
    expect(props).toContain("requestAlreadyExists");
    expect(props).toContain("sameUser");
    expect(props).toContain("address");
    expect(props).toContain("fileName");
    expect(props).toContain("status");
  });

  test("check that it is unique file", async () => {
    expect(_responseSubmitJson.requestAlreadyExists).toEqual(false);
  });
});

test.describe("submit file, uploaded file and the same user", async () => {
  let _responseSubmit: any;
  let _responseJson: any;
  let _responseSubmitJson: any;
  let start: any;
  let end: any;

  test.beforeAll(async ({ request, baseURL }) => {
    _responseJson = await login({ request, baseURL });
    writeFileSync(`./playwright/attachments/${name}.pdf`, `${text}`);
    const file = readFileSync(`./playwright/attachments/${name}.pdf`);

    await submitReport(
      { request, baseURL },
      _responseJson.accessToken,
      file,
      name
    );

    start = new Date();
    _responseSubmit = await request.post(`${baseURL}/api/Report/v2/request`, {
      headers: {
        Authorization: `Bearer ${_responseJson.accessToken}`,
      },
      multipart: {
        file: {
          name: `./playwright/attachments/${name}.pdf`,
          mimeType: "application/octet-stream",
          buffer: file,
        },
        address1: String(addressDetails[2]).split(",")[0],
        city: "Annapolis",
        state: "MD",
        zip: 21401,
        longtitude: addressDetails[0],
        latitude: addressDetails[1],
      },
    });
    end = new Date();

    _responseSubmitJson = await _responseSubmit.json();
  });

  test.afterAll(async () => {
    unlinkSync(`./playwright/attachments/${name}.pdf`);
  });

  test("response time should be less than 5000s", async () => {
    expect(end - start).toBeLessThan(5000);
  });

  test("status should equal 200", async () => {
    expect(_responseSubmit.status()).toBe(200);
  });

  test("response body should be an object", async () => {
    expect(typeof _responseSubmitJson).toBe("object");
  });

  test("check response headers", async () => {
    const headers = _responseSubmit.headers();
    expect(Object.keys(headers)).toContain("content-type");
    expect(headers["content-type"]).toContain("application/json");
  });

  test("check response props", async () => {
    const props = Object.keys(_responseSubmitJson);
    expect(props).toContain("requestId");
    expect(props).toContain("requestAlreadyExists");
    expect(props).toContain("sameUser");
    expect(props).toContain("address");
    expect(props).toContain("fileName");
    expect(props).toContain("status");
  });

  test("check that it is unique file", async () => {
    expect(_responseSubmitJson.requestAlreadyExists).toEqual(true);
    expect(_responseSubmitJson.sameUser).toEqual(true);
    expect(_responseSubmitJson.fileName).not.toBeNull();
  });
});

test.describe("submit file, uploaded file, another user", async () => {
  let _responseSubmit: any;
  let _responseJson: any;
  let _responseSubmitJson: any;
  let start: any;
  let end: any;

  test.beforeAll(async ({ request, baseURL }) => {
    _responseJson = await login({ request, baseURL });
    writeFileSync(`./playwright/attachments/${name}.pdf`, `${text}`);

    const file = readFileSync(`./playwright/attachments/${name}.pdf`);
    await submitReport(
      { request, baseURL },
      _responseJson.accessToken,
      file,
      name
    );

    _responseJson = await login({ request, baseURL }, "cveqn34@mailto.plus");

    start = new Date();
    _responseSubmit = await request.post(`${baseURL}/api/Report/v2/request`, {
      headers: {
        Authorization: `Bearer ${_responseJson.accessToken}`,
      },
      multipart: {
        file: {
          name: `./playwright/attachments/${name}.pdf`,
          mimeType: "application/octet-stream",
          buffer: file,
        },
        address1: String(addressDetails[2]).split(",")[0],
        city: "Annapolis",
        state: "MD",
        zip: 21401,
        longtitude: addressDetails[0],
        latitude: addressDetails[1],
      },
    });
    end = new Date();

    _responseSubmitJson = await _responseSubmit.json();
  });

  test.afterAll(async () => {
    unlinkSync(`./playwright/attachments/${name}.pdf`);
  });

  test("response time should be less than 5000s", async () => {
    expect(end - start).toBeLessThan(5000);
  });

  test("status should equal 200", async () => {
    expect(_responseSubmit.status()).toBe(200);
  });

  test("response body should be an object", async () => {
    expect(typeof _responseSubmitJson).toBe("object");
  });

  test("check response headers", async () => {
    const headers = _responseSubmit.headers();
    expect(Object.keys(headers)).toContain("content-type");
    expect(headers["content-type"]).toContain("application/json");
  });

  test("check response props", async () => {
    const props = Object.keys(_responseSubmitJson);
    expect(props).toContain("requestId");
    expect(props).toContain("requestAlreadyExists");
    expect(props).toContain("sameUser");
    expect(props).toContain("address");
    expect(props).toContain("fileName");
    expect(props).toContain("status");
  });

  test("check that it is unique file", async () => {
    expect(_responseSubmitJson.requestAlreadyExists).toEqual(true);
    expect(_responseSubmitJson.sameUser).toEqual(false);
    expect(_responseSubmitJson.fileName).not.toBeNull();
  });
});
