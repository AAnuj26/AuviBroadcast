import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";

import Response from "../../utils/Response";

import { AzureBlobService } from "../../services/azure/AzureService";

import FirebaseService from "../../services/firebase/FireBaseService";

const AzureBlob = new AzureBlobService();

const FireBase = new FirebaseService();

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
      return new Response(400, "All Fields Are Required", null);
    }
    const avatar = userData.get("avatar");
    if (!avatar) {
      return new Response(400, "Avatar Is Required", null);
    }
    let avatarUrl: string;
    let coverImageUrl: string;
    for (const [key, value] of userData.entries()) {
      if (value instanceof Blob) {
        const blobName = `${displayName}-${key}-${Date.now()}-blob.jpg`;
        const blobArrayBuffer = await value.arrayBuffer();
        const blobUrl = await AzureBlob.uploadBlob(blobName, blobArrayBuffer);
        if (key === "avatar") {
          avatarUrl = blobUrl;
        }
        if (key === "coverImage") {
          coverImageUrl = blobUrl;
        }
      }
    }
    const user = {
      fullName: fullName,
      displayName: displayName,
      phoneNumber: phoneNumber ? phoneNumber : null,
      age: age ? age : null,
      email: email,
      password: password,
      photoURL: avatarUrl,
      coverImage: coverImageUrl ? coverImageUrl : null,
    };

    const createduser = await FireBase.registerUser(user);
    if (createduser instanceof Error) {
      return new Response(
        500,
        "Firebase Error While Registering User",
        createduser
      );
    }

    return new Response(201, "User Registered Successfully", user);
  } catch (error) {
    return new Response(
      500,
      error,
      "Internal Server Error While Registering User"
    );
  }
  /*-------------------------------------------------------*/
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
        "Firebase Error While Logging In User",
        loginUser
      );
    }

    return new Response(200, "User Logged In Successfully", loginUser);
  } catch (error) {
    return new Response(
      500,
      "Internal Server Error While Logging In User",
      error
    );
  }
}

export async function loginUserWithGoogle(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const loggedInWithGoogle = await FireBase.loginWithGoogle();
    if (loggedInWithGoogle instanceof Error) {
      return new Response(
        401,
        "Firebase Error While Logging In User",
        loggedInWithGoogle
      );
    }
    return new Response(200, "User Logged In Successfully", loggedInWithGoogle);
  } catch (error) {
    return new Response(
      500,
      "Internal Server Error While Logging In User",
      error
    );
  }
}

export async function logoutUser(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return FireBase.authenticator(request, context, async () => {
    try {
      await FireBase.logoutUser();
      return new Response(200, "User Logged Out Successfully", null);
    } catch (error) {
      return new Response(
        500,
        "Internal Server Error While Logging Out User",
        error
      );
    }
  });
}

export async function changeCurrentPassword(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  return FireBase.authenticator(request, context, async () => {
    try {
      const userData = await request.formData();
      const email: string = userData.get("email").toString();

      const changedPassword = await FireBase.resetPassword(email);
      if (changedPassword instanceof Error) {
        return new Response(
          401,
          "Firebase Error While Changing Password",
          changedPassword
        );
      }

      return new Response(
        200,
        "Password Changed Successfully",
        changedPassword
      );
    } catch (error) {
      return new Response(
        500,
        "Internal Server Error While Changing Password",
        error
      );
    }
  });
}

app.http("registerUser", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "user/registerUser",
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

app.http("changeCurrentPassword", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "user/changeCurrentPassword",
  handler: changeCurrentPassword,
});

app.http("loginUserWithGoogle", {
  methods: ["POST"],
  authLevel: "anonymous",
  route: "user/loginUserWithGoogle",
  handler: loginUserWithGoogle,
});
