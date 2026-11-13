const test = require('node:test');
const assert = require('node:assert/strict');

const ticketService = require('../src/backend/src/services/ticketService');
const { getHttpStatus } = require('../src/backend/src/errors/errorHandler');
const repository = require('../src/backend/src/repositories/ticketRepository');

const originalRepository = { ...repository };
const TEST_AUTH = Object.freeze({
  id: '1',
  username: 'test-staff',
  role: 'STAFF',
});
const TEST_AUTH_B = Object.freeze({
  id: '2',
  username: 'test-staff-b',
  role: 'STAFF',
});
const TEST_ADMIN = Object.freeze({
  id: '99',
  username: 'test-admin',
  role: 'ADMIN',
});

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
    }, TEST_AUTH);

    assert.equal(result.status, 'MOI');
    assert.equal(result.ticket_code, 'BH-000999/2026');
    assert.deepEqual(result.accessories, ['SAC', 'HOP']);
  } finally {
    restoreRepository();
  }
});

test('Ownership: phiếu mới lưu ID nhân viên đang đăng nhập', async () => {
  try {
    stubValidRepository();

    let capturedInput;

    repository.create = async (input) => {
      capturedInput = input;

      return {
        ticket_id: 'TEST-2',
        ticket_code: 'BH-000998/2026',
        status: 'MOI',
      };
    };

    await ticketService.create({
      customer_id: 1,
      device_id: 7,
      center_id: 1,
      category_id: 1,
      issue_desc: 'Kiểm tra người tạo phiếu bảo hành',
      priority: 'TRUNG_BINH',
      accessories: [],
    }, TEST_AUTH);

    assert.equal(capturedInput.created_by, TEST_AUTH.id);
  } finally {
    restoreRepository();
  }
});

test('Ownership: nhân viên B không xem được phiếu của A', async () => {
  try {
    repository.findById = async (id, ownerId) => {
      assert.equal(ownerId, TEST_AUTH_B.id);
      return null;
    };

    await assert.rejects(
      ticketService.getById(10, TEST_AUTH_B),
      (error) => {
        assert.equal(error.code, 'TICKET_NOT_FOUND');
        return true;
      }
    );
  } finally {
    restoreRepository();
  }
});

test('Ownership: nhân viên B không cập nhật được phiếu của A', async () => {
  try {
    repository.findById = async (id, ownerId) => {
      assert.equal(ownerId, TEST_AUTH_B.id);
      return null;
    };

    await assert.rejects(
      ticketService.update(10, {}, TEST_AUTH_B),
      (error) => {
        assert.equal(error.code, 'TICKET_NOT_FOUND');
        return true;
      }
    );
  } finally {
    restoreRepository();
  }
});

test('Ownership: nhân viên B không hủy được phiếu của A', async () => {
  try {
    repository.findById = async (id, ownerId) => {
      assert.equal(ownerId, TEST_AUTH_B.id);
      return null;
    };

    await assert.rejects(
      ticketService.cancel(10, TEST_AUTH_B),
      (error) => {
        assert.equal(error.code, 'TICKET_NOT_FOUND');
        return true;
      }
    );
  } finally {
    restoreRepository();
  }
});

test('Ownership: nhân viên chỉ lấy danh sách phiếu của mình', async () => {
  try {
    let queryOptions;

    repository.list = async (options) => {
      queryOptions = options;
      return [];
    };

    await ticketService.list({}, TEST_AUTH);

    assert.equal(queryOptions.ownerId, TEST_AUTH.id);
  } finally {
    restoreRepository();
  }
});

test('Authorization: ADMIN được xem tất cả phiếu', async () => {
  try {
    let queryOptions;

    repository.list = async (options) => {
      queryOptions = options;
      return [];
    };

    await ticketService.list({}, TEST_ADMIN);

    assert.equal(queryOptions.ownerId, null);
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
    }, TEST_AUTH);

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
      }, TEST_AUTH),
      (error) => {
        assert.equal(error.code, 'VALIDATION_FAILED');
        assert.ok(error.fields.issue_desc);
        return true;
      }
    );
  } finally {
    restoreRepository();
  }
});

test('Not found: từ chối khi thiết bị không tồn tại', async () => {
  try {
    stubValidRepository();
    repository.findDevice = async () => null;

    await assert.rejects(
      ticketService.create({
        customer_id: 1,
        device_id: 99999,
        center_id: 1,
        category_id: 1,
        issue_desc: 'Kiểm tra thiết bị không tồn tại',
        priority: 'TRUNG_BINH',
        accessories: [],
      }, TEST_AUTH),
      (error) => {
        assert.equal(error.code, 'RESOURCE_NOT_FOUND');
        assert.ok(error.fields.device_id);
        return true;
      }
    );
  } finally {
    restoreRepository();
  }
});

test('Validation: từ chối khi thiết bị không thuộc khách hàng', async () => {
  try {
    stubValidRepository();
    repository.findDevice = async (id) => ({
      device_id: id,
      customer_id: '2',
      purchase_date: new Date().toISOString().slice(0, 10),
      warranty_months: 12,
    });

    await assert.rejects(
      ticketService.create({
        customer_id: 1,
        device_id: 7,
        center_id: 1,
        category_id: 1,
        issue_desc: 'Kiểm tra quyền sở hữu thiết bị',
        priority: 'TRUNG_BINH',
        accessories: [],
      }, TEST_AUTH),
      (error) => {
        assert.equal(error.code, 'VALIDATION_FAILED');
        assert.ok(error.fields.device_id);
        return true;
      }
    );
  } finally {
    restoreRepository();
  }
});

test('Conflict: từ chối thiết bị đã có phiếu đang xử lý', async () => {
  try {
    stubValidRepository();
    repository.findOpenByDevice = async () => ({
      ticket_id: 'OLD-TICKET',
      status: 'MOI',
    });

    await assert.rejects(
      ticketService.create({
        customer_id: 1,
        device_id: 7,
        center_id: 1,
        category_id: 1,
        issue_desc: 'Kiểm tra phiếu đang xử lý của thiết bị',
        priority: 'TRUNG_BINH',
        accessories: [],
      }, TEST_AUTH),
      (error) => {
        assert.equal(error.code, 'ACTIVE_TICKET_EXISTS');
        assert.ok(error.fields.device_id);
        return true;
      }
    );
  } finally {
    restoreRepository();
  }
});

test('Warranty: yêu cầu phê duyệt khi thiết bị đã hết hạn bảo hành', async () => {
  try {
    stubValidRepository();
    repository.findDevice = async (id) => ({
      device_id: id,
      customer_id: '1',
      purchase_date: '2020-01-01',
      warranty_months: 12,
    });

    await assert.rejects(
      ticketService.create({
        customer_id: 1,
        device_id: 7,
        center_id: 1,
        category_id: 1,
        issue_desc: 'Kiểm tra thiết bị đã hết hạn bảo hành',
        priority: 'TRUNG_BINH',
        accessories: [],
      }, TEST_AUTH),
      (error) => {
        assert.equal(error.code, 'WARRANTY_APPROVAL_REQUIRED');
        assert.ok(error.fields.device_id);
        return true;
      }
    );
  } finally {
    restoreRepository();
  }
});


test('Due date: ?p d?ng SLA theo ba m?c ?u ti?n v? b? qua Ch? nh?t', () => {
  const receivedAt = new Date('2026-10-30T03:54:00.000Z');

  assert.equal(
    ticketService.calculateDueDate(receivedAt, 'CAO').toISOString(),
    '2026-10-31T03:54:00.000Z'
  );

  assert.equal(
    ticketService.calculateDueDate(receivedAt, 'TRUNG_BINH').toISOString(),
    '2026-11-03T03:54:00.000Z'
  );

  assert.equal(
    ticketService.calculateDueDate(receivedAt, 'THAP').toISOString(),
    '2026-11-05T03:54:00.000Z'
  );
});

test('Due date: ti?p nh?n v?o Ch? nh?t th? b?t ??u t?nh t? th? Hai', () => {
  const receivedAt = new Date('2026-11-01T03:54:00.000Z');

  assert.equal(
    ticketService.calculateDueDate(receivedAt, 'CAO').toISOString(),
    '2026-11-02T03:54:00.000Z'
  );

  assert.equal(
    ticketService.calculateDueDate(receivedAt, 'TRUNG_BINH').toISOString(),
    '2026-11-04T03:54:00.000Z'
  );

  assert.equal(
    ticketService.calculateDueDate(receivedAt, 'THAP').toISOString(),
    '2026-11-06T03:54:00.000Z'
  );
});

test('Due date: invalid priority throws Error', () => {
  assert.throws(
    () => ticketService.calculateDueDate(new Date(), 'KHAN_CAP'),
    Error
  );
});

test('HTTP mapping: ma loi nghiep vu duoc anh xa dung status', () => {
  const cases = [
    ['INVALID_ID', 400],
    ['VALIDATION_FAILED', 400],
    ['INVALID_PHONE', 422],
    ['WARRANTY_APPROVAL_REQUIRED', 422],
    ['CUSTOMER_NOT_FOUND', 404],
    ['RESOURCE_NOT_FOUND', 404],
    ['ACTIVE_TICKET_EXISTS', 409],
    ['DUPLICATE_VALUE', 409],
    ['TICKET_CANNOT_BE_CANCELLED', 409],
  ];

  for (const [code, expectedStatus] of cases) {
    assert.equal(
      getHttpStatus({ code }),
      expectedStatus,
      `Ma loi ${code} phai tra HTTP ${expectedStatus}`
    );
  }

  assert.equal(getHttpStatus({ code: 'UNKNOWN_ERROR' }), 500);
  assert.equal(getHttpStatus(new Error('Unexpected error')), 500);
});
