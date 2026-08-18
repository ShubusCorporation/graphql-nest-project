/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never;
    };
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type OnBookAddedSubscriptionVariables = Exact<{ [key: string]: never }>;

export type OnBookAddedSubscription = { bookAdded: { title: string } };

export const OnBookAddedDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'subscription',
      name: { kind: 'Name', value: 'OnBookAdded' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'bookAdded' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'title' } },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<
  OnBookAddedSubscription,
  OnBookAddedSubscriptionVariables
>;
