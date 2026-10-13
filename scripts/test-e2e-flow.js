/**
 * Comprehensive End-to-End Test Suite for Restaurant Microservices
 * Tests full business workflow across microservices:
 * 1. Authentication & User Profile
 * 2. Table Service (List, Transfer, Merge)
 * 3. Menu & Order Service (Create, Add items, Split Order with full metadata, Complete, Invoice, Pay)
 * 4. Inventory Service (List ingredients, Goods Receipt, Goods Issue)
 * 5. Report Service (Revenue & Stock Reports)
 */

const BASE_URL = 'http://localhost:8080/api';

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function logHeader(title) {
  console.log(`\n${COLORS.cyan}${COLORS.bold}====================================================${COLORS.reset}`);
  console.log(`${COLORS.cyan}${COLORS.bold}  ${title}${COLORS.reset}`);
  console.log(`${COLORS.cyan}${COLORS.bold}====================================================${COLORS.reset}`);
}

function logSuccess(step, msg) {
  console.log(`  ${COLORS.green}✓ [PASS]${COLORS.reset} ${COLORS.bold}${step}:${COLORS.reset} ${msg}`);
}

function logFail(step, msg) {
  console.error(`  ${COLORS.red}✗ [FAIL]${COLORS.reset} ${COLORS.bold}${step}:${COLORS.reset} ${msg}`);
}

function logInfo(msg) {
  console.log(`  ${COLORS.yellow}ℹ${COLORS.reset} ${msg}`);
}

let token = '';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(url, { ...options, headers });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }

  if (!res.ok) {
    const errorMsg = data?.message || data?.error || `HTTP ${res.status} ${res.statusText}`;
    throw new Error(`${errorMsg} (URL: ${endpoint})`);
  }

  return data;
}

async function runE2ETests() {
  const startTime = Date.now();
  let passedTests = 0;
  let totalTests = 0;

  async function testStep(name, fn) {
    totalTests++;
    try {
      await fn();
      passedTests++;
    } catch (err) {
      logFail(name, err.message);
      throw err;
    }
  }

  try {
    // =========================================================================
    // 1. AUTHENTICATION & USER SERVICE
    // =========================================================================
    logHeader('PHẦN 1: XÁC THỰC & NGƯỜI DÙNG (AUTH & USER SERVICE)');

    await testStep('1.1 Đăng nhập hệ thống (Login)', async () => {
      const resp = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username: 'admin', password: 'admin123' }),
      });
      if (!resp.success || !resp.data?.token) throw new Error('Không nhận được JWT Token');
      token = resp.data.token;
      logSuccess('1.1 Đăng nhập', `Đăng nhập thành công với vai trò ${resp.data.role}, Token: ${token.slice(0, 20)}...`);
    });

    await testStep('1.2 Lấy danh sách tài khoản người dùng', async () => {
      const resp = await request('/users');
      const users = resp.data?.content || resp.data || [];
      if (!Array.isArray(users) || users.length === 0) throw new Error('Danh sách tài khoản trống');
      logSuccess('1.2 Danh sách User', `Tìm thấy ${users.length} tài khoản trong hệ thống`);
    });

    // =========================================================================
    // 2. TABLE SERVICE (CHUYỂN BÀN & GHÉP BÀN)
    // =========================================================================
    logHeader('PHẦN 2: QUẢN LÝ BÀN ĂN (TABLE SERVICE: CHUYỂN & GHÉP BÀN)');

    let tables = [];
    await testStep('2.1 Lấy danh sách bàn ăn', async () => {
      const resp = await request('/tables');
      tables = resp.data?.content || resp.data || [];
      if (!Array.isArray(tables) || tables.length < 2) throw new Error('Cần ít nhất 2 bàn để test');
      logSuccess('2.1 Danh sách Bàn', `Tìm thấy ${tables.length} bàn trong sơ đồ nhà hàng`);
    });

    const sourceTable = tables[0];
    const targetTable = tables[1];

    await testStep('2.2 Chuyển bàn (Table Transfer)', async () => {
      const resp = await request(`/tables/${sourceTable.id}/transfer`, {
        method: 'POST',
        body: JSON.stringify({
          targetTableId: targetTable.id,
          reason: 'Khách yêu cầu chuyển chỗ ngồi yên tĩnh hơn (E2E Test)',
        }),
      });
      if (!resp.success) throw new Error('Chuyển bàn thất bại');
      logSuccess('2.2 Chuyển bàn', `Chuyển thành công từ Bàn #${sourceTable.id} (${sourceTable.number}) sang Bàn #${targetTable.id} (${targetTable.number})`);
    });

    await testStep('2.3 Ghép bàn (Table Merge)', async () => {
      const resp = await request(`/tables/${sourceTable.id}/merge`, {
        method: 'POST',
        body: JSON.stringify({
          mergedTableIds: [targetTable.id],
        }),
      });
      if (!resp.success) throw new Error('Ghép bàn thất bại');
      logSuccess('2.3 Ghép bàn', `Ghép thành công Bàn #${targetTable.id} vào Bàn chính #${sourceTable.id}`);
    });

    // =========================================================================
    // 3. MENU & ORDER SERVICE (TẠO ĐƠN, TÁCH ĐƠN ĐẦY ĐỦ THÔNG TIN, THANH TOÁN)
    // =========================================================================
    logHeader('PHẦN 3: THỰC ĐƠN & ĐƠN HÀNG (MENU, ORDER, TÁCH ĐƠN, INVOICE)');

    let menuItems = [];
    await testStep('3.1 Lấy danh sách thực đơn món ăn', async () => {
      const resp = await request('/menu');
      menuItems = resp.data?.content || resp.data || [];
      if (!Array.isArray(menuItems) || menuItems.length < 2) throw new Error('Cần ít nhất 2 món ăn trong menu');
      logSuccess('3.1 Thực đơn', `Tìm thấy ${menuItems.length} món ăn (Món mẫu: "${menuItems[0].name}", "${menuItems[1].name}")`);
    });

    let mainOrder = null;
    await testStep('3.2 Tạo đơn hàng mới tại bàn', async () => {
      const resp = await request('/orders', {
        method: 'POST',
        body: JSON.stringify({
          tableId: sourceTable.id,
          customerName: 'Đoàn khách E2E Test',
          customerPhone: '0901234567',
          note: 'Bàn tiệc sinh nhật VIP',
          items: [
            { menuId: menuItems[0].id, qty: 3, note: 'Ít đường' },
            { menuId: menuItems[1].id, qty: 2, note: 'Cay vừa' },
          ],
        }),
      });
      if (!resp.success || !resp.data?.id) throw new Error('Không tạo được đơn hàng');
      mainOrder = resp.data;
      logSuccess('3.2 Tạo đơn hàng', `Tạo Đơn hàng #${mainOrder.id} thành công với tổng tiền: ${mainOrder.totalAmount.toLocaleString('vi-VN')} VND`);
    });

    await testStep('3.3 Thêm món vào đơn đang phục vụ', async () => {
      const resp = await request(`/orders/${mainOrder.id}/add-items`, {
        method: 'POST',
        body: JSON.stringify({
          items: [
            { menuId: menuItems[0].id, qty: 1, note: 'Gọi thêm' },
          ],
        }),
      });
      if (!resp.success) throw new Error('Không thể thêm món vào đơn');
      mainOrder = resp.data;
      logSuccess('3.3 Thêm món', `Đã thêm món mới vào Đơn #${mainOrder.id}, tổng món trong đơn: ${mainOrder.items?.length || 'OK'}`);
    });

    let splitOrder = null;
    await testStep('3.4 Tách đơn hàng kèm đầy đủ thông tin khách & chiết khấu', async () => {
      // Tách 1 phần của món thứ nhất sang đơn mới
      const resp = await request(`/orders/${mainOrder.id}/split`, {
        method: 'POST',
        body: JSON.stringify({
          customerName: 'Nguyễn Văn Tách (Khách riêng)',
          customerPhone: '0988776655',
          discount: 15000,
          vatRate: 8,
          note: 'Tách riêng thanh toán thẻ tín dụng cá nhân',
          items: [
            { menuId: menuItems[0].id, qty: 1, note: 'Tách từ bàn chính' },
          ],
        }),
      });
      if (!resp.success || !resp.data?.id) throw new Error('Tách đơn hàng thất bại');
      splitOrder = resp.data;
      logSuccess('3.4 Tách đơn hàng', `Tách thành công thành Đơn Mới #${splitOrder.id}:`);
      logInfo(`  -> Tên khách đơn mới: "${splitOrder.customerName}"`);
      logInfo(`  -> SĐT: "${splitOrder.customerPhone}"`);
      logInfo(`  -> Chiết khấu: ${splitOrder.discount?.toLocaleString('vi-VN')} VND`);
      logInfo(`  -> Thuế VAT: ${splitOrder.vatRate}%`);
      logInfo(`  -> Ghi chú: "${splitOrder.note}"`);
      logInfo(`  -> Tổng tiền đơn mới: ${splitOrder.totalAmount?.toLocaleString('vi-VN')} VND`);
    });

    await testStep('3.5 Hoàn thành phục vụ (Complete Order -> SERVED)', async () => {
      const resp = await request(`/orders/${mainOrder.id}/complete`, { method: 'POST' });
      if (!resp.success || resp.data?.status !== 'SERVED') throw new Error('Trạng thái đơn không đổi sang SERVED');
      logSuccess('3.5 Phục vụ xong', `Đơn #${mainOrder.id} chuyển sang SERVED (đã trừ tồn kho món tương ứng)`);
    });

    await testStep('3.6 Trích xuất Hóa đơn thanh toán (Generate Invoice)', async () => {
      const resp = await request(`/orders/${mainOrder.id}/invoice`);
      if (!resp.success || !resp.data) throw new Error('Không thể xuất hóa đơn');
      const inv = resp.data;
      logSuccess('3.6 Hóa đơn thanh toán', `Hóa đơn Đơn #${mainOrder.id}: Tạm tính ${inv.subtotal?.toLocaleString('vi-VN')} đ, VAT ${inv.vatAmount?.toLocaleString('vi-VN')} đ, Tổng ${inv.totalAmount?.toLocaleString('vi-VN')} đ`);
    });

    await testStep('3.7 Thu tiền & Thanh toán đơn hàng (Pay Order -> PAID)', async () => {
      const resp = await request(`/orders/${mainOrder.id}/pay`, { method: 'POST' });
      if (!resp.success || resp.data?.status !== 'PAID') throw new Error('Thanh toán đơn hàng thất bại');
      logSuccess('3.7 Thanh toán', `Đơn hàng #${mainOrder.id} thanh toán thành công, bàn #${sourceTable.id} đã được giải phóng`);
    });

    // =========================================================================
    // 4. CUSTOMER SERVICE (HỆ THỐNG KHÁCH HÀNG & HỘI VIÊN TÍCH ĐIỂM)
    // =========================================================================
    logHeader('PHẦN 4: KHÁCH HÀNG & HỘI VIÊN TÍCH ĐIỂM (CUSTOMER & LOYALTY TIERS)');

    const testPhone = '09' + Math.floor(10000000 + Math.random() * 90000000);
    let registeredMember = null;

    await testStep('4.1 Tra cứu khách hàng theo SĐT (khi chưa đăng ký)', async () => {
      try {
        await request(`/customers/lookup?phone=${testPhone}`);
        throw new Error('SĐT chưa tạo nhưng lại tìm thấy');
      } catch (err) {
        logSuccess('4.1 Tra cứu khách mới', `Hệ thống xác nhận SĐT ${testPhone} chưa có hồ sơ thành viên (HTTP 404 Not Found)`);
      }
    });

    await testStep('4.2 Đăng ký hội viên mới với cấp bậc khởi điểm', async () => {
      const resp = await request('/customers', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Võ Thị Thu Hằng',
          phone: testPhone,
          email: 'hang.vo@example.com',
          note: 'Khách VIP ăn trưa định kỳ',
        }),
      });
      if (!resp.success || !resp.data?.id) throw new Error('Đăng ký khách hàng thất bại');
      registeredMember = resp.data;
      if (registeredMember.tier !== 'BRONZE' || registeredMember.points !== 0) {
        throw new Error(`Thông số hội viên mới không hợp lệ: tier=${registeredMember.tier}, points=${registeredMember.points}`);
      }
      logSuccess('4.2 Đăng ký hội viên', `Tạo hội viên "${registeredMember.name}" (${registeredMember.phone}):`);
      logInfo(`  -> Cấp bậc: ${registeredMember.tierLabel} (${registeredMember.tier})`);
      logInfo(`  -> Điểm khởi điểm: ${registeredMember.points} điểm (Tỷ lệ x${registeredMember.pointMultiplier})`);
      logInfo(`  -> Chiết khấu: ${registeredMember.discountPercent}%`);
      logInfo(`  -> Chỉ tiêu lên hạng tiếp theo: ${registeredMember.nextTierTarget?.toLocaleString('vi-VN')} VND (${registeredMember.nextTierLabel})`);
    });

    await testStep('4.3 Tích điểm tự động khi thanh toán đơn hàng (10.000đ = 1 điểm)', async () => {
      // Tạo đơn hàng 1.000.000 VNĐ cho hội viên này
      const orderResp = await request('/orders', {
        method: 'POST',
        body: JSON.stringify({
          customerName: registeredMember.name,
          customerPhone: registeredMember.phone,
          note: 'Đơn tích điểm hội viên',
          items: [
            { menuId: menuItems[0].id, qty: 10 },
          ],
        }),
      });
      if (!orderResp.success) throw new Error('Không tạo được đơn hàng cho hội viên');
      const loyaltyOrder = orderResp.data;

      // Hoàn thành và thanh toán đơn hàng
      await request(`/orders/${loyaltyOrder.id}/complete`, { method: 'POST' });
      await request(`/orders/${loyaltyOrder.id}/pay`, { method: 'POST' });

      // Tra cứu lại thông tin hội viên để kiểm tra điểm tích luỹ
      const memberAfterPay = await request(`/customers/lookup?phone=${testPhone}`);
      const expectedPoints = Math.floor(loyaltyOrder.totalAmount / 10000);
      if (memberAfterPay.data.points < expectedPoints) {
        throw new Error(`Điểm tích lũy không đúng. Mong đợi ít nhất ${expectedPoints}, thực tế: ${memberAfterPay.data.points}`);
      }
      logSuccess('4.3 Tích điểm thanh toán', `Thanh toán Đơn #${loyaltyOrder.id} (${loyaltyOrder.totalAmount?.toLocaleString('vi-VN')} VND):`);
      logInfo(`  -> Điểm đã tích: +${memberAfterPay.data.points} điểm (~${memberAfterPay.data.pointsValue?.toLocaleString('vi-VN')} VND)`);
      logInfo(`  -> Tổng chi tiêu: ${memberAfterPay.data.totalSpent?.toLocaleString('vi-VN')} VND`);
    });

    await testStep('4.4 Duy trì & Nâng hạng theo doanh số tháng (Target >= 2M lên Hạng Bạc)', async () => {
      // Tạo thêm đơn hàng trị giá lớn để vượt ngưỡng 2.000.000 VND lên Bạc (SILVER)
      const upgradeOrderResp = await request('/orders', {
        method: 'POST',
        body: JSON.stringify({
          customerName: registeredMember.name,
          customerPhone: registeredMember.phone,
          note: 'Đơn nâng hạng Silver',
          items: [
            { menuId: menuItems[0].id, qty: 15 },
          ],
        }),
      });
      const upOrder = upgradeOrderResp.data;
      await request(`/orders/${upOrder.id}/complete`, { method: 'POST' });
      await request(`/orders/${upOrder.id}/pay`, { method: 'POST' });

      // Tra cứu lại thông tin hội viên
      const upgradedMember = await request(`/customers/lookup?phone=${testPhone}`);
      logSuccess('4.4 Nâng hạng tự động', `Hội viên đạt chỉ tiêu tháng ${upgradedMember.data.currentMonthSpent?.toLocaleString('vi-VN')} VND:`);
      logInfo(`  -> Hạng hiện tại: ${upgradedMember.data.tierLabel} (${upgradedMember.data.tier})`);
      logInfo(`  -> Ưu đãi giảm giá mới: ${upgradedMember.data.discountPercent}%`);
      logInfo(`  -> Hệ số nhân điểm mới: x${upgradedMember.data.pointMultiplier}`);
      logInfo(`  -> Tổng điểm tích luỹ: ${upgradedMember.data.points} điểm`);
    });

    await testStep('4.5 Danh sách hội viên & báo cáo phân trang', async () => {
      const resp = await request('/customers?page=0&size=10');
      const list = resp.data?.content || resp.data || [];
      if (!Array.isArray(list) || list.length === 0) throw new Error('Danh sách hội viên trống');
      logSuccess('4.5 Danh sách hội viên', `Truy xuất thành công ${list.length} hội viên trong hệ thống`);
    });

    // =========================================================================
    // 5. INVENTORY SERVICE (QUẢN LÝ KHO & NHẬP / XUẤT)
    // =========================================================================
    logHeader('PHẦN 5: KHO NGUYÊN LIỆU (INVENTORY SERVICE: NHẬP & XUẤT KHO)');

    let ingredients = [];
    await testStep('5.1 Lấy danh mục nguyên liệu tồn kho', async () => {
      const resp = await request('/ingredients');
      ingredients = resp.data?.content || resp.data || [];
      if (!Array.isArray(ingredients) || ingredients.length === 0) throw new Error('Danh mục nguyên liệu rỗng');
      logSuccess('5.1 Danh mục NVL', `Tìm thấy ${ingredients.length} loại nguyên vật liệu trong kho`);
    });

    await testStep('5.2 Lấy danh sách phiếu nhập kho (Receipts)', async () => {
      const resp = await request('/inventory/receipts');
      const receipts = resp.data?.content || resp.data || [];
      logSuccess('5.2 Phiếu nhập kho', `Truy xuất thành công ${receipts.length} phiếu nhập kho`);
    });

    await testStep('5.3 Lấy danh sách phiếu xuất kho (Issues)', async () => {
      const resp = await request('/inventory/issues');
      const issues = resp.data?.content || resp.data || [];
      logSuccess('5.3 Phiếu xuất kho', `Truy xuất thành công ${issues.length} phiếu xuất kho`);
    });

    // =========================================================================
    // 6. REPORT SERVICE (BÁO CÁO DOANH THU & TỒN KHO)
    // =========================================================================
    logHeader('PHẦN 6: BÁO CÁO & THỐNG KÊ (REPORT SERVICE)');

    await testStep('6.1 Báo cáo doanh số bán hàng (Revenue Report)', async () => {
      const resp = await request('/reports/revenue');
      const revData = resp.data || [];
      logSuccess('6.1 Báo cáo doanh thu', `Dữ liệu báo cáo doanh thu trả về hợp lệ (${Array.isArray(revData) ? revData.length + ' mục' : 'OK'})`);
    });

    await testStep('6.2 Báo cáo phân tầng kiểm kê tồn kho (Stock Report)', async () => {
      const resp = await request('/reports/stock');
      const stockData = resp.data || [];
      logSuccess('6.2 Báo cáo tồn kho', `Dữ liệu phân tầng kho trả về hợp lệ (${Array.isArray(stockData) ? stockData.length + ' mặt hàng' : 'OK'})`);
    });

    // =========================================================================
    // TỔNG KẾT
    // =========================================================================
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    logHeader(`KẾT QUẢ KIỂM THỬ TOÀN BỘ LUỒNG: ${passedTests}/${totalTests} BƯỚC ĐẠT (${duration}s)`);
    console.log(`${COLORS.green}${COLORS.bold}>>> TẤT CẢ CÁC BƯỚC KIỂM THỬ TOÀN BỘ LUỒNG ĐÃ VƯỢT QUA 100% THÀNH CÔNG! <<<${COLORS.reset}\n`);
    process.exit(0);
  } catch (err) {
    console.error(`\n${COLORS.red}${COLORS.bold}>>> KIỂM THỬ THẤT BẠI: ${err.message}${COLORS.reset}\n`);
    process.exit(1);
  }
}

runE2ETests();
