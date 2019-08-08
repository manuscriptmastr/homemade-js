import gql, { g } from './graphql';

const payload = {
  sprints: [
    {
      name: 'Sprint 1',
      id: 123,
      boardId: 135
    },
    {
      name: 'Sprint 2',
      id: 456,
      boardId: 246
    }
  ],
  boards: [
    {
      name: 'WillowTree Website',
      id: 135
    },
    {
      name: 'Fox News',
      id: 246
    }
  ],
  issues: [
    {
      name: 'Fix button on homepage',
      id: 321,
      sprintId: 123,
      boardId: 135
    },
    {
      name: 'Video should close on finish',
      id: 432,
      sprintId: 456,
      boardId: 246
    }
  ]
};

const boardByIssue = (issue, { boards }) =>
  boards.find(b => b.id === issue.boardId);

const issuesByBoard = (board, { issues }) =>
  issues.filter(i => i.boardId === board.id);

const query = gql('boards', [{
  id: g('id'),
  name: g('name'),
  issues: g(issuesByBoard, [{
    id: g('id'),
    name: g('name'),
    board: g(boardByIssue)
  }])
}]);

query(payload);
