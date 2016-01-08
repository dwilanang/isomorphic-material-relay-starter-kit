import React from 'react';
import Relay from 'react-relay';

import Checkbox from 'material-ui/lib/checkbox';
import List from 'material-ui/lib/lists/list';
import Tabs from 'material-ui/lib/tabs/tabs';
import Tab from 'material-ui/lib/tabs/tab';

import ToDo_list_updateMarkAllMutation from '../mutations/ToDo_list_updateMarkAllMutation';
import ToDo_Item from './ToDo_Item.jsx';

class ToDo_List extends React.Component
{
  _handleMarkAllOnCheck( event, checked )
  {
    Relay.Store.update(
      new ToDo_list_updateMarkAllMutation( {
        complete: checked,
        todos: this.props.viewer.todos,
        viewer: this.props.viewer,
      } )
    );
  }

  renderToDos( )
  {
    return this.props.viewer.todos.edges.map(edge =>
      <ToDo_Item
        key={edge.node.id}
        todo={edge.node}
        viewer={this.props.viewer}
      />
    );
  }

  _handleTabsChange( value )
  {
    this.context.history.pushState( null, '/todos/' + value );
  }

  renderTabs( )
  {
    return(
      <Tabs valueLink={ { value: this.props.relay.variables.status, requestChange: this._handleTabsChange.bind( this ) } }>
        <Tab label="All" value="any" />
        <Tab label="Active" value="active" />
        <Tab label="Completed" value="completed" />
      </Tabs>
    );
  }

  render( )
  {
    var numToDos = this.props.viewer.totalCount;
    var numCompletedToDos = this.props.viewer.completedCount;
    return (
      <div>
        { this.renderTabs( ) }
        <Checkbox
          label="Mark all as complete"
          defaultChecked={ numToDos === numCompletedToDos }
          onCheck={ this._handleMarkAllOnCheck.bind( this ) }
        />
        <List>
          { this.renderToDos( ) }
        </List>
      </div>
    );
  }
}

ToDo_List.contextTypes = {
  history: React.PropTypes.object,
};

export default Relay.createContainer( ToDo_List, {
  initialVariables:
  {
    status: null,
  },

  prepareVariables( { status } )
  {
    var nextStatus;
    if (status === 'active' || status === 'completed')
      nextStatus = status;
    else
      // This matches the Backbone example, which displays all todos on an
      // invalid route.
      nextStatus = 'any';

    return {
      status: nextStatus,
      limit: 2147483647,
    };
  },

  fragments: {
    viewer: () => Relay.QL`
      fragment on User {
        completedCount,
        todos(status: $status, first: $limit) {
          edges {
            node {
              id,
              ${ToDo_Item.getFragment('todo')},
            },
          },
          ${ToDo_list_updateMarkAllMutation.getFragment('todos')},
        },
        totalCount,
        ${ToDo_list_updateMarkAllMutation.getFragment('viewer')},
        ${ToDo_Item.getFragment('viewer')},
      }
    `,
  },
});
