/* @flow weak */

import { fromGlobalId, mutationWithClientMutationId } from "graphql-relay";
import { GraphQLBoolean, GraphQLID, GraphQLList, GraphQLNonNull } from "graphql";

import ToDoType from '../type/ToDoType';
import ViewerType from '../../../../graphql/type/ViewerType';


export default mutationWithClientMutationId( {
  name: 'ToDo_list_updateMarkAll',
  inputFields: {
    ToDo_Complete: { type: new GraphQLNonNull( GraphQLBoolean ) },
  },
  outputFields: {
    changedToDos: {
      type: new GraphQLList(ToDoType),
      resolve: ( {changedToDoLocalIds} ) => changedToDoLocalIds.map( DA_ToDo_get ),
    },
    Viewer: {
      type: ViewerType,
      resolve: ( parent, args, { rootValue: {user_id, objectManager} } ) => objectManager.getOneById( 'User', user_id )
    },
  },
  mutateAndGetPayload: ( {ToDo_Complete}, { rootValue: {user_id} } ) =>
  {
    return DA_ToDo_list_updateMarkAll( user_id, ToDo_Complete )
    .then( ( changedToDoLocalIds ) => ( {changedToDoLocalIds} ) )
    ;
  }
} );