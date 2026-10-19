const test = require('node:test');
const assert = require('node:assert/strict');

const ticketService = require('../src/backend/src/services/ticketService');
const repository = require('../src/backend/src/repositories/ticketRepository');

const originalRepository = { ...repository };

function restoreRepository() {
  Object.assign(repository, originalRepository);
}

function stubValidRepository() {
  repository.findCustomer = async (id) => ({ customer_id: id });

  repository.findDevice = async (id) => ({
    device_id: id,
    customer_id: '1',
    purchase_date: new Date().toISOString().slice(0, 10),
    warranty_months: 12,
  });

  repository.findCategory = async (id) => ({
    category_id: id,
    is_active: true,
  });

  repository.findServiceCenter = async (id) => ({
    center_id: id,
    is_active: true,
  });

  repository.findOpenByDevice = async () => null;

  repository.create = async (input) => ({
    ticket_id: 'TEST-1',
    ticket_code: 'BH-000999/2026',
    status: 'MOI',
    category_id: input.category_id,
    issue_desc: input.issue_desc,
    priority: input.priority,
    accessories: input.accessories,
  });
}

test('Happy path: tạo phiếu khi dữ liệu hợp lệ', async () => {
  try {
    stubValidRepository();

    const result = await ticketService.create({
      customer_id: 1,
      device_id: 7,
      center_id: 1,
      category_id: 1,
      issue_desc: 'Màn hình xuất hiện nhấp nháy khi sử dụng',
      priority: 'TRUNG_BINH',
      accessories: ['SAC', 'HOP'],
    });

    assert.equal(result.status, 'MOI');
    assert.equal(result.ticket_code, 'BH-000999/2026');
    assert.deepEqual(result.accessories, ['SAC', 'HOP']);
  } finally {
    restoreRepository();
  }
});

test('Boundary: chấp nhận mô tả đúng 10 ký tự', async () => {
  try {
    stubValidRepository();

    const result = await ticketService.create({
      customer_id: 1,
      device_id: 7,
      center_id: 1,
      category_id: 1,
      issue_desc: '1234567890',
      priority: 'CAO',
      accessories: [],
    });

    assert.equal(result.issue_desc, '1234567890');
  } finally {
    restoreRepository();
  }
});

test('Invalid data: từ chối mô tả ngắn hơn 10 ký tự', async () => {
  try {
    await assert.rejects(
      ticketService.create({
        customer_id: 1,
        device_id: 7,
        center_id: 1,
        category_id: 1,
        issue_desc: 'Lỗi',
        priority: 'CAO',
        accessories: ['SAC'],
      }),
      (error) => {
        assert.equal(error.statusCode, 400);
        assert.equal(error.code, 'VALIDATION_FAILED');
        assert.ok(error.fields.issue_desc);
        return true;
      }
    );
  } finally {
    restoreRepository();
  }
});
