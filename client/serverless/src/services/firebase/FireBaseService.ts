import { initializeApp, FirebaseApp, FirebaseOptions } from "firebase/app";

import {
  Auth,
  getAuth,
  createUserWithEmailAndPassword,
  UserCredential,
  User,
  updateProfile,
  signInWithEmailAndPassword,
  updatePassword,
} from "firebase/auth";

import {
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";

import Response from "../../utils/Response";

import admin from "firebase-admin";

import { getDatabase, Database, ref, set, get, child } from "firebase/database";

import AzureKeyVaultService from "../azure/AzureKeyVaultService";

const azureKeyVault: AzureKeyVaultService = new AzureKeyVaultService();

interface UserSchema {
  fullName: string;
  displayName: string;
  phoneNumber?: string;
  age?: number;
  email: string;
  password: string;
  photoURL: string;
  coverImage?: string;
}

interface UserObject extends UserSchema {
  uid: string;
  createdAt: string;
  updatedAt: string;
  watchHistory: string[] | boolean;
}

class FirebaseService {
  private myFirebaseApp: FirebaseApp;
  private auth: Auth;
  private database: Database;
  private admin: admin.app.App;

  constructor() {
    this.myFirebaseApp = null;
    this.auth = null;
    this.database = null;
    this.admin = null;
    this.initializeFirebase();
  }

  public async initializeFirebase(): Promise<void | Error> {
    try {
      if (this.myFirebaseApp && this.auth && this.database && this.admin) {
        return;
      } else {
        const firebaseConfig: FirebaseOptions =
          await azureKeyVault.getFireBaseValues();
        this.myFirebaseApp = initializeApp(firebaseConfig);
        this.auth = getAuth(this.myFirebaseApp);
        this.database = getDatabase(this.myFirebaseApp);
        this.admin = admin.initializeApp(firebaseConfig);
        return;
      }
    } catch (error) {
      return error;
    }
  }
  public async authenticator(
    request: HttpRequest,
    context: InvocationContext,
    next: () => Promise<HttpResponseInit>
  ): Promise<HttpResponseInit> {
    try {
      let currentUserToken: string;
      try {
        currentUserToken = await this.auth.currentUser
          .getIdToken(/* forceRefresh true*/)
          .then((idToken) => {
            console.log("Token from auth : \n", idToken);
            return idToken;
          });
      } catch (error) {
        return new Response(401, "Unauthorized Request : No User Found", error);
      }
      let isValid: any;
      try {
        isValid = await this.admin
          .auth()
          .verifyIdToken(currentUserToken)
          .then((decodedToken) => {
            return decodedToken;
          });
      } catch (error) {
        return new Response(403, "Unauthorized Request : Invalid Token", error);
      }

      if (isValid) {
        return next();
      }
    } catch (error) {
      return new Response(500, "FireBase Error While Authorizing ", error);
    }
  }

  public async registerUser(userData: UserSchema): Promise<UserObject | Error> {
    try {
      await this.initializeFirebase();

      const userCredential: UserCredential =
        await createUserWithEmailAndPassword(
          this.auth,
          userData.email,
          userData.password
        );

      await updateProfile(userCredential.user, {
        displayName: userData.displayName,
        photoURL: userData.photoURL,
      });

      const user: User = this.auth.currentUser;

      const createUser: UserObject = {
        uid: user.uid,
        fullName: userData.fullName,
        displayName: user.displayName,
        email: user.email,
        password: userData.password,
        phoneNumber: userData.phoneNumber ? userData.phoneNumber : null,
        age: userData.age ? userData.age : null,
        photoURL: userData.photoURL,
        coverImage: userData.coverImage ? userData.coverImage : null,
        watchHistory: null,
        createdAt: user.metadata.creationTime,
        updatedAt: user.metadata.lastSignInTime,
      };

      await set(ref(this.database, `users/${user.uid}`), createUser);

      return createUser;
    } catch (error) {
      return error;
    }
  }

  public async loginUser(user: {
    email: string;
    password: string;
  }): Promise<User | Error> {
    try {
      await this.initializeFirebase();

      const userCredential: UserCredential = await signInWithEmailAndPassword(
        this.auth,
        user.email,
        user.password
      );

      return userCredential.user;
    } catch (error) {
      return error;
    }
  }

  public async logoutUser(): Promise<boolean | Error> {
    try {
      await this.initializeFirebase();

      if (this.auth.currentUser) {
        await this.auth.signOut();
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return error;
    }
  }
  public async updateUserPassword(
    newPassword: string
  ): Promise<boolean | Error> {
    try {
      await this.initializeFirebase();
      await updatePassword(this.auth.currentUser, newPassword);
      return true;
    } catch (error) {
      return error;
    }
  }

  public async currentUser(): Promise<UserObject | Error> {
    const user: User = this.auth.currentUser;

    return await get(child(ref(this.database), `users/${user.uid}`))
      .then((snapshot) => {
        if (snapshot.exists()) {
          return snapshot.val();
        }
      })
      .catch((error) => {
        return error;
      });
  }
  public async updateAccountDetails(
    displayName: string,
    email: string,
    fullName?: string,
    phoneNumber?: string,
    age?: number
  ): Promise<boolean | Error> {
    const userInfo = {
      displayName: displayName,
      email: email,
    };

    if (fullName) {
      userInfo["fullName"] = fullName;
    }
    if (phoneNumber) {
      userInfo["phoneNumber"] = phoneNumber;
    }
    if (age) {
      userInfo["age"] = age;
    }

    try {
      await updateProfile(this.auth.currentUser, userInfo);
      return true;
    } catch (error) {
      return error;
    }
  }
}

export default FirebaseService;
