/* @flow weak */

import { globalIdField } from "graphql-relay";
import { GraphQLID, GraphQLBoolean, GraphQLInt, GraphQLString, GraphQLObjectType } from "graphql";
import { fromGlobalId, connectionArgs, connectionFromArray } from "graphql-relay";


import CompendiumsConnection from "./CompendiumsConnection";
import { DA_Compendium_list_get } from '../../data/da/Compendium';
import { DA_ToDo_list_get } from '../../data/da/ToDo';
import NodeInterface from "../interface/NodeInterface";
import EnsayosConnection from "../../units/imrsk-example-ensayo/graphql/type/EnsayosConnection";
import EnsayoType from "../../units/imrsk-example-ensayo/graphql/type/EnsayoType";
import ToDosConnection from "./ToDosConnection";
import TranslaticiarumsConnection from "../../units/imrsk-example-translaticiarum/graphql/type/TranslaticiarumsConnection";
import User from '../../data/model/User';
import { Uuid } from '../../data/da_cassandra/_client.js';

const Uuid_0 = Uuid.fromString( '00000000-0000-0000-0000-000000000000' );

export default new GraphQLObjectType( {
  name: 'Viewer',
  interfaces: [NodeInterface],
  isTypeOf: object => object instanceof User,
  fields: {
    id: globalIdField('Viewer'),

    // ->->-> User properties

    User_IsAnonymous:  { type: GraphQLBoolean, resolve: (obj) => obj.id.equals( Uuid_0 ) },
    User_DisplayName:  { type: GraphQLString,  resolve: (obj) => obj.User_DisplayName },
    User_ProfilePhoto: { type: GraphQLString,  resolve: (obj) => obj.User_ProfilePhoto },
    User_Email:        { type: GraphQLString,  resolve: (obj) => obj.User_Email },
    User_Locale:       { type: GraphQLString,  resolve: (obj) => obj.User_Locale },
    User_AuthToken:    { type: GraphQLString,  resolve: (obj) => obj.User_AuthToken },

    // <-<-<- User properties

    // ->->-> Compendium access through user

    compendiums: {
      type: CompendiumsConnection.connectionType,
      args: { ...connectionArgs },
      resolve: ( obj, { ...args }, { rootValue: {user_id} } ) => DA_Compendium_list_get( user_id ).then( ( list ) => connectionFromArray( list, args ) )
    },

    // <-<-<- Compendium access through user

    // ->->-> Ensayo access through user

    Ensayos: {
      type: EnsayosConnection.connectionType,
      args: { ...connectionArgs },
      resolve: ( obj, { ...args }, { rootValue: {user_id, objectManager} } ) => objectManager.getListBy( 'Ensayo', 'Ensayo_User_id', user_id.toString( ) ).then( ( arr ) => connectionFromArray( arr, args ) )
    },
    Ensayo: {
      type: EnsayoType,
      args: { ...{ id: { type: GraphQLID } } },
      resolve: ( parent, { id }, { rootValue: {user_id, objectManager} } ) => objectManager.getOneById( 'Ensayo', fromGlobalId(id).id ),
    },

    // <-<-<- Ensayo access through user

    // ->->-> ToDo access through user

    ToDos: {
      type: ToDosConnection.connectionType,
      args: {
        status: {
          type: GraphQLString,
          defaultValue: 'any',
        },
        ...connectionArgs,
      },
      resolve: ( obj, { status, ...args }, { rootValue: {user_id} } ) => DA_ToDo_list_get( user_id, status ).then( ( arr_ToDo ) => connectionFromArray( arr_ToDo, args ) )
    },
    ToDo_TotalCount: {
      type: GraphQLInt,
      resolve: ( obj, { status, ...args }, { rootValue: {user_id} } ) => DA_ToDo_list_get( user_id ).then( ( arr_ToDo ) => arr_ToDo.length )
    },
    ToDo_CompletedCount: {
      type: GraphQLInt,
      resolve: ( obj, { status, ...args }, { rootValue: {user_id} } ) => DA_ToDo_list_get( user_id, 'completed' ).then( ( arr_ToDo ) => arr_ToDo.length )
    },

    // <-<-<- ToDo access through user

    // ->->-> Translaticiarum access through user

    Translaticiarums: {
      type: TranslaticiarumsConnection.connectionType,
      args: { ...connectionArgs },
      resolve: ( obj, { ...args }, { rootValue: {user_id, objectManager} } ) => objectManager.getListBy( 'Translaticiarum', 'Translaticiarum_User_id', user_id.toString( ) ).then( ( arr ) => connectionFromArray( arr, args ) )
    },

    // <-<-<- Translaticiarum access through user
  },
} );
