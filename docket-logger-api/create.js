import uuid from "uuid";
import * as dynamoDbLib from "./libs/dynamodb-lib";
import { success, failure } from "./libs/response-lib";

export async function main(event, context, callback) {
 // Request body is passed in as a JSON encoded string in 'event.body'
 const data = JSON.parse(event.body);

 const params = {
  TableName: "dockets",
  // 'Item' contains the attributes of the item to be created
  // - 'userId': user identities are federated through the
  //             Cognito Identity Pool, we will use the identity id
  //             as the user id of the authenticated user
  // - 'noteId': a unique uuid
  // - 'content': parsed from request body
  // - 'attachment': parsed from request body
  // - 'createdAt': current Unix timestamp
  Item: {
   userId: event.requestContext.identity.cognitoIdentityId,
   docketId: uuid.v1(),
   docketIdNum: data.docketIdNum,
   docketAttachment: data.docketAttachment,
   prestartAttachment: data.prestartAttachment,
   jsaAttachment: data.jsaAttachment,
   tipAttachment: data.tipAttachment,
   employeeId: data.employeeId,
   workHours: data.workHours,
   startDate: data.startDate,
   endDate: data.endDate,
   docketIdNum: data.docketIdNum,
   rego: data.rego,
   break: data.break,
   didTip: data.didTip,
   tipLocation: data.tipLocation,
   tipDocketId: data.tipDocketId,
   tipQuantity: data.tipQuantity,
   didJSA: data.didJSA,
   didPrestart: data.didPrestart,
   createdAt: Date.now(),
  }
 };

 try {
  await dynamoDbLib.call("put", params);
  callback(null, success(params.Item));
 } catch (e) {
  callback(null, failure({ status: false }));
 }
}