import {
  generateUser,
  translate as t,
} from '../../../../../helpers/api-integration/v3';
import { v4 as generateUUID } from 'uuid';

describe('PUT /tasks/:taskId/checklist/:itemId', () => {
  let user;

  before(async () => {
    user = await generateUser();
  });

  it('updates a checklist item', async () => {
    let task = await user.post('/tasks', {
      type: 'daily',
      text: 'Daily with checklist',
    });

    let savedTask = await user.post(`/tasks/${task._id}/checklist`, {
      text: 'Checklist Item 1',
      completed: false,
    });

    savedTask = await user.put(`/tasks/${task._id}/checklist/${savedTask.checklist[0]._id}`, {
      text: 'updated',
      completed: true,
      _id: 123,
    });

    expect(savedTask.checklist.length).to.equal(1);
    expect(savedTask.checklist[0].text).to.equal('updated');
    expect(savedTask.checklist[0].completed).to.equal(true);
    expect(savedTask.checklist[0]._id).to.not.equal('123');
  });

  it('fails on habits', async () => {
    let habit = await user.post('/tasks', {
      type: 'habit',
      text: 'habit with checklist',
    });

    await expect(user.put(`/tasks/${habit._id}/checklist/${generateUUID()}`)).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('checklistOnlyDailyTodo'),
    });
  });

  it('fails on rewards', async () => {
    let reward = await user.post('/tasks', {
      type: 'reward',
      text: 'reward with checklist',
    });

    await expect(user.put(`/tasks/${reward._id}/checklist/${generateUUID()}`)).to.eventually.be.rejected.and.eql({
      code: 400,
      error: 'BadRequest',
      message: t('checklistOnlyDailyTodo'),
    });
  });

  it('fails on task not found', async () => {
    await expect(user.put(`/tasks/${generateUUID()}/checklist/${generateUUID()}`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('taskNotFound'),
    });
  });

  it('fails on checklist item not found', async () => {
    let createdTask = await user.post('/tasks', {
      type: 'daily',
      text: 'daily with checklist',
    });

    await expect(user.put(`/tasks/${createdTask._id}/checklist/${generateUUID()}`)).to.eventually.be.rejected.and.eql({
      code: 404,
      error: 'NotFound',
      message: t('checklistItemNotFound'),
    });
  });
});
