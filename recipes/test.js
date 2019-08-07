import assert from 'assert';
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

const sprintByIssue = (issue, { sprints }) =>
  sprints.find(s => s.id === issue.sprintId);

const issuesByBoard = (board, { issues }) =>
  issues.filter(i => i.boardId === board.id);

const issuesBySprint = (sprint, { issues }) =>
  issues.filter(i => i.sprintId === sprint.id);

const issue = {
  id: g('id'),
  name: g('name'),
  board: g(boardByIssue)
};

const board = {
  id: g('id'),
  name: g('name'),
  issues: g(issuesByBoard, [issue])
};

const sprint = {
  id: g('id'),
  name: g('name'),
  issues: g(issuesBySprint)
};

const query = gql('boards', [board]);
