import { test, expect, APIResponse } from "@playwright/test";

test.describe("admin login with valid data", () => {
  let _response: APIResponse;
  let _responseJson: object;
  let start: any;
  let end: any;

  test.beforeAll(async ({ request, baseURL }) => {
    start = new Date();
    _response = await request.post(`${baseURL}/api/auth/login-admin`, {
      data: {
        email: "admin@platform.com",
        password: "QW12qw!@",
      },
    });
    end = new Date();

    _responseJson = await _response.json();
  });

  test("response time should be less than 5000s", async () => {
    expect(end - start).toBeLessThan(5000);
  });

  test("status should equal 200", async () => {
    expect(_response.status()).toBe(200);
  });

  test("response body should be an object", async () => {
    expect(typeof _responseJson).toBe("object");
  });

  test("check response headers", async () => {
    const headers = _response.headers();
    expect(Object.keys(headers)).toContain("content-type");
    expect(headers["content-type"]).toContain("application/json");
  });

  test("check the response props", async () => {
    const props = Object.keys(_responseJson);
    expect(props).toContain("accessToken");
    expect(props).toContain("accessTokenExpiration");
    expect(props).toContain("refreshToken");
    expect(props).toContain("emailConfirmed");
    expect(props).toContain("userId");
    expect(props).toContain("partnerCode");
    expect(props).toContain("partnerType");
    expect(props).toContain("partnerCode");
    expect(props).toContain("registrationStates");
  });
});
