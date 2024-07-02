import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";

import FirebaseService from "../../services/firebase/FireBaseService";

import AwsService from "../../services/aws/AwsService";

import Response from "../../utils/Response";

const FireBase: FirebaseService = new FirebaseService();

const Aws: AwsService = new AwsService();

export async function registerUser(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const userData = await request.formData();

    const fullName: string = userData.get("fullName").toString();
    const displayName: string = userData.get("displayName").toString();
    const phoneNumber: string = userData.get("phoneNumber")
      ? userData.get("phoneNumber").toString()
      : null;
    const age: number = Number(userData.get("age"));
    const email: string = userData.get("email").toString();
    const password: string = userData.get("password").toString();

    if (!displayName || !email || !password || !fullName) {
      return new Response(400, null, "All Fields Are Required");
    }

    const avatar = userData.get("avatar");

    if (!avatar) {
      return new Response(400, null, "Avatar Is Required");
    }

    let avatarLink: string;
    let coverImageLink: string;

    for (const [key, value] of userData.entries()) {
      if (value instanceof Blob) {
        const Key = `auvi-${key}-${Date.now()}`;
        const Body = await value.arrayBuffer().then((buffer) => {
          return Buffer.from(buffer);
        });
        await Aws.uploadFile(Key, Body);
        await Aws.getSignedUrl(Key).then((url) => {
          if (key == "avatar") {
            if (url instanceof Error) {
              return new Response(401, url, "Error While Uploading Avatar");
            } else {
              avatarLink = url.toString();
            }
          } else if (key == "coverImage") {
            if (url instanceof Error) {
              return new Response(
                401,
                url,
                "Error While Uploading Cover Image"
              );
            } else {
              coverImageLink = url.toString();
            }
          }
        });
      }
    }

    const user = {
      fullName: fullName,
      displayName: displayName,
      phoneNumber: phoneNumber ? phoneNumber : null,
      age: age ? age : null,
      email: email,
      password: password,
      photoURL: avatarLink,
      coverImage: coverImageLink ? coverImageLink : null,
    };

    const createduser = await FireBase.registerUser(user);
    if (createduser instanceof Error) {
      return new Response(
        500,
        createduser,
        "Firebase Error While Registering User"
      );
    }

    return new Response(201, createduser, "User Registered Successfully");
  } catch (error) {
    console.log(error.message);
    console.log(error);
    return new Response(
      500,
      error,
      "Internal Server Error While Registering User"
    );
  }
}
export async function loginUser(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const userData = await request.formData();
    const email: string = userData.get("email").toString();
    const password: string = userData.get("password").toString();

    const user = {
      email: email,
      password: password,
    };

    const loginUser = await FireBase.loginUser(user);
    if (loginUser instanceof Error) {
      return new Response(
        401,
        loginUser,
        "Firebase Error While Logging In User"
      );
    }

    return new Response(200, loginUser, "User Logged In Successfully");
  } catch (error) {
    return new Response(
      500,
      error,
      "Internal Server Error While Logging In User"
    );
  }
}

export async function logoutUser(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    await FireBase.logoutUser();
    return new Response(200, null, "User Logged Out Successfully");
  } catch (error) {
    return new Response(
      500,
      error,
      "Internal Server Error While Logging Out User"
    );
  }
}

app.http("registerUser", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "users/registerUser",
  handler: registerUser,
});

app.http("loginUser", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "user/loginUser",
  handler: loginUser,
});

app.http("logoutUser", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "user/logoutUser",
  handler: logoutUser,
});
