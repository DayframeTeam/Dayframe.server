const templateSubtaskModel = require('../models/templateSubtaskModel');
const templateTaskModel = require('../models/templateTaskModel');

exports.getAllByUserId = (req, res) => {
  const userId = Number(req.params.id);

  if (!userId) {
    return res.status(400).json({ error: 'Не передан id пользователя' });
  }

  templateSubtaskModel
    .getAllByUserId(userId)
    .then(([rows]) => res.json(rows))
    .catch((err) => {
      console.error('Ошибка при получении шаблонов подзадач:', err);
      res.status(500).json({ error: err.message });
    });
};

exports.getAllByParentId = (req, res) => {
  const parentId = Number(req.params.id);

  if (!parentId) {
    return res.status(400).json({ error: 'Не передан id родительской задачи' });
  }

  templateSubtaskModel
    .getAllByParentId(parentId)
    .then(([rows]) => res.json(rows))
    .catch((err) => {
      console.error(
        'Ошибка при получении шаблонных подзадач по родителю:',
        err,
      );
      res.status(500).json({ error: err.message });
    });
};

exports.createTemplateSubtask = (req, res) => {
  const subtask = req.body;

  templateSubtaskModel
    .addTemplateSubtask(subtask)
    .then(([result]) => templateSubtaskModel.getById(result.insertId))
    .then(([rows]) => {
      if (!rows || rows.length === 0) {
        return res
          .status(404)
          .json({ error: 'Шаблон подзадачи не найден после создания' });
      }

      return templateTaskModel
        .updateStatusByTemplateSubtasks(subtask.template_task_id)
        .then(() => res.status(201).json(rows[0]));
    })
    .catch((err) => {
      console.error('❌ Ошибка при создании шаблона подзадачи:', err);
      res.status(500).json({ error: 'Ошибка при создании шаблона подзадачи' });
    });
};

exports.deleteTemplateSubtask = (req, res) => {
  const id = req.params.id;

  templateSubtaskModel
    .getById(id)
    .then(([rows]) => {
      if (!rows.length) {
        return res.status(404).json({ error: 'Шаблон подзадачи не найден' });
      }

      const template_task_id = rows[0].template_task_id;

      return templateSubtaskModel
        .deleteById(id)
        .then(() =>
          templateTaskModel.updateStatusByTemplateSubtasks(template_task_id),
        )
        .then(() => res.json({ message: '✅ Шаблон подзадачи удалён' }));
    })
    .catch((err) => {
      console.error('❌ Ошибка при удалении шаблона подзадачи:', err);
      res.status(500).json({ error: 'Ошибка при удалении шаблона подзадачи' });
    });
};

exports.updateTemplateSubtaskStatus = (req, res) => {
  const id = Number(req.params.id);
  const { is_done } = req.body;

  if (typeof is_done !== 'boolean') {
    return res.status(400).json({ error: 'Поле is_done должно быть boolean' });
  }

  templateSubtaskModel
    .getById(id)
    .then(([rows]) => {
      if (!rows.length) {
        return res.status(404).json({ error: 'Шаблон подзадачи не найден' });
      }

      const template_task_id = rows[0].template_task_id;

      return templateSubtaskModel
        .updateStatus(id, is_done)
        .then(() =>
          templateTaskModel.updateStatusByTemplateSubtasks(template_task_id),
        )
        .then(() =>
          res.json({ message: '✅ Статус шаблона подзадачи обновлён' }),
        );
    })
    .catch((err) => {
      console.error('❌ Ошибка при обновлении статуса шаблона подзадачи:', err);
      res.status(500).json({ error: 'Ошибка при обновлении статуса' });
    });
};
