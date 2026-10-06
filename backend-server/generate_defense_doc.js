const fs = require('fs');
const path = require('path');
const docx = require('docx');
const {
    Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
    WidthType, BorderStyle, AlignmentType, ShadingType, Header, Footer, PageNumber
} = docx;

// Color Palette
const COLOR_PRIMARY = "1E3A8A";     // Deep Navy
const COLOR_SECONDARY = "0D9488";   // Teal
const COLOR_ACCENT = "2563EB";      // Royal Blue
const COLOR_DARK = "1E293B";        // Slate Dark
const COLOR_MUTED = "64748B";       // Slate Gray
const COLOR_BG_LIGHT = "F8FAFC";    // Light Slate
const COLOR_BG_CODE = "F1F5F9";     // Light Gray for Code
const COLOR_CALLOUT_BORDER = "3B82F6"; // Border Blue
const COLOR_WHITE = "FFFFFF";
const COLOR_WARN = "B45309";        // Amber dark
const COLOR_CRITICAL = "B91C1C";    // Red dark
const COLOR_SUCCESS = "15803D";     // Green dark

function createTitle(text) {
    return new Paragraph({
        heading: HeadingLevel.TITLE,
        spacing: { before: 240, after: 120 },
        alignment: AlignmentType.CENTER,
        children: [
            new TextRun({
                text: text,
                bold: true,
                size: 38,
                color: COLOR_PRIMARY,
                font: "Calibri"
            })
        ]
    });
}

function createSubtitle(text) {
    return new Paragraph({
        spacing: { before: 0, after: 360 },
        alignment: AlignmentType.CENTER,
        children: [
            new TextRun({
                text: text,
                italics: true,
                size: 24,
                color: COLOR_MUTED,
                font: "Calibri"
            })
        ]
    });
}

function createH1(number, title) {
    return new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 360, after: 140 },
        children: [
            new TextRun({
                text: `CÂU ${number}: ${title.toUpperCase()}`,
                bold: true,
                size: 28,
                color: COLOR_PRIMARY,
                font: "Calibri"
            })
        ]
    });
}

function createH2(title) {
    return new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 100 },
        children: [
            new TextRun({
                text: title,
                bold: true,
                size: 24,
                color: COLOR_SECONDARY,
                font: "Calibri"
            })
        ]
    });
}

function createH3(title) {
    return new Paragraph({
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 140, after: 60 },
        children: [
            new TextRun({
                text: title,
                bold: true,
                size: 22,
                color: COLOR_DARK,
                font: "Calibri"
            })
        ]
    });
}

function createP(text, options = {}) {
    return new Paragraph({
        spacing: { before: 60, after: 60, line: 276 },
        alignment: options.alignment || AlignmentType.LEFT,
        children: [
            new TextRun({
                text: text,
                size: 22,
                color: options.color || COLOR_DARK,
                bold: options.bold || false,
                italics: options.italics || false,
                font: "Calibri"
            })
        ]
    });
}

function createBullet(text, boldPrefix = "", level = 0) {
    const children = [];
    if (boldPrefix) {
        children.push(new TextRun({
            text: boldPrefix,
            bold: true,
            size: 22,
            color: COLOR_DARK,
            font: "Calibri"
        }));
    }
    children.push(new TextRun({
        text: text,
        size: 22,
        color: COLOR_DARK,
        font: "Calibri"
    }));

    return new Paragraph({
        bullet: { level: level },
        spacing: { before: 40, after: 40, line: 260 },
        children: children
    });
}

function createCodeBlock(codeLines) {
    return codeLines.map((line, idx) => new Paragraph({
        spacing: { before: idx === 0 ? 80 : 20, after: idx === codeLines.length - 1 ? 80 : 20 },
        shading: { type: ShadingType.CLEAR, fill: COLOR_BG_CODE },
        children: [
            new TextRun({
                text: line,
                size: 19,
                color: "1E293B",
                font: "Consolas"
            })
        ]
    }));
}

function createCallout(title, content, type = "info") {
    let borderColor = COLOR_CALLOUT_BORDER;
    let titleColor = COLOR_ACCENT;
    if (type === "warning") { borderColor = COLOR_WARN; titleColor = COLOR_WARN; }
    if (type === "critical") { borderColor = COLOR_CRITICAL; titleColor = COLOR_CRITICAL; }
    if (type === "success") { borderColor = COLOR_SUCCESS; titleColor = COLOR_SUCCESS; }

    return [
        new Paragraph({
            spacing: { before: 120, after: 40 },
            shading: { type: ShadingType.CLEAR, fill: COLOR_BG_LIGHT },
            border: {
                left: { style: BorderStyle.SINGLE, size: 24, color: borderColor }
            },
            children: [
                new TextRun({
                    text: `📌 ${title}`,
                    bold: true,
                    size: 22,
                    color: titleColor,
                    font: "Calibri"
                })
            ]
        }),
        new Paragraph({
            spacing: { before: 40, after: 120 },
            shading: { type: ShadingType.CLEAR, fill: COLOR_BG_LIGHT },
            border: {
                left: { style: BorderStyle.SINGLE, size: 24, color: borderColor }
            },
            children: [
                new TextRun({
                    text: content,
                    size: 21,
                    color: COLOR_DARK,
                    italics: true,
                    font: "Calibri"
                })
            ]
        })
    ];
}

function createTable(headers, rows, colWidths = []) {
    const tableRows = [];

    tableRows.push(new TableRow({
        tableHeader: true,
        children: headers.map((h, i) => new TableCell({
            width: colWidths[i] ? { size: colWidths[i], type: WidthType.DXA } : undefined,
            shading: { type: ShadingType.CLEAR, fill: COLOR_PRIMARY },
            margins: { top: 120, bottom: 120, left: 140, right: 140 },
            children: [
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                        new TextRun({
                            text: h,
                            bold: true,
                            size: 21,
                            color: COLOR_WHITE,
                            font: "Calibri"
                        })
                    ]
                })
            ]
        }))
    }));

    rows.forEach((row, rIdx) => {
        const bg = rIdx % 2 === 0 ? COLOR_WHITE : COLOR_BG_LIGHT;
        tableRows.push(new TableRow({
            children: row.map((cellText, cIdx) => new TableCell({
                width: colWidths[cIdx] ? { size: colWidths[cIdx], type: WidthType.DXA } : undefined,
                shading: { type: ShadingType.CLEAR, fill: bg },
                margins: { top: 100, bottom: 100, left: 140, right: 140 },
                children: [
                    new Paragraph({
                        alignment: AlignmentType.LEFT,
                        children: [
                            new TextRun({
                                text: cellText,
                                size: 20,
                                color: COLOR_DARK,
                                font: "Calibri"
                            })
                        ]
                    })
                ]
            }))
        }));
    });

    return new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: tableRows
    });
}

async function buildDoc() {
    const doc = new Document({
        styles: {
            default: {
                document: {
                    run: {
                        font: "Calibri",
                        size: 22,
                        color: COLOR_DARK
                    }
                }
            }
        },
        sections: [{
            properties: {
                page: {
                    margin: {
                        top: 1440,
                        bottom: 1440,
                        left: 1440,
                        right: 1440
                    }
                }
            },
            headers: {
                default: new Header({
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.RIGHT,
                            children: [
                                new TextRun({
                                    text: "BẢNG GIẢI ĐÁP BẢO VỆ ĐỒ ÁN: RESTAURANT MICROSERVICES (SOA)",
                                    size: 18,
                                    color: COLOR_MUTED,
                                    italics: true
                                })
                            ]
                        })
                    ]
                })
            },
            footers: {
                default: new Footer({
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({ text: "Trang ", size: 18, color: COLOR_MUTED }),
                                new TextRun({ children: [PageNumber.CURRENT], size: 18, color: COLOR_MUTED }),
                                new TextRun({ text: " / ", size: 18, color: COLOR_MUTED }),
                                new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, color: COLOR_MUTED })
                            ]
                        })
                    ]
                })
            },
            children: [
                createTitle("TÀI LIỆU GIẢI ĐÁP BẢO VỆ ĐỒ ÁN MÔN HỌC"),
                createSubtitle("Hệ Thống Quản Lý Nhà Hàng Ẩm Thực Theo Kiến Trúc Hướng Dịch Vụ (Microservices & SOA)\nKèm Báo Cáo Rà Soát Lỗ Hổng & Mã Nguồn Đã Được Nâng Cấp Hoàn Thiện"),

                createTable(
                    ["Hạng Mục", "Nội Dung Chi Tiết"],
                    [
                        ["Đề Tài", "Hệ thống quản lý nhà hàng phân tán (Restaurant Microservices Management System)"],
                        ["Môn Học", "Phần mềm hướng dịch vụ (SOA / Microservices Architecture)"],
                        ["Công Nghệ Cốt Lõi", "Java 17, Spring Boot 3.x, Spring Cloud Gateway, Eureka, OpenFeign, RabbitMQ, Docker"],
                        ["Cơ Sở Dữ Liệu", "MySQL 8.0 (Database-per-Service: 7 CSDL độc lập trên Docker 3307 - 3313)"],
                        ["Giao Diện & KDS", "React 18, TypeScript, Vite, Tailwind CSS, TanStack Query, Zustand"],
                        ["Nhóm Thực Hiện", "Lê Minh Duy (Lead), Phạm Chấn Hưng, Nguyễn Mạnh Đức, Trần Đức Mạnh, Đàm Quang Sáng"],
                        ["Trạng Thái Mã Nguồn", "ĐÃ RÀ SOÁT VÀ NÂNG CẤP TRỰC TIẾP TOÀN BỘ CÁC LỖ HỔNG (Idempotency, Locking, Rollback, Timeouts, IDOR)"]
                    ],
                    [2800, 6500]
                ),

                new Paragraph({ spacing: { before: 200, after: 200 }, children: [] }),

                ...createCallout(
                    "MỤC TIÊU VÀ NGUYÊN TẮC BẢO VỆ",
                    "Tài liệu này được biên soạn bám sát 100% mã nguồn thực tế của dự án. Mọi câu trả lời đều đi kèm dẫn chứng file, class, method, endpoint, bảng CSDL, và phân tích đa chiều. Đặc biệt, các điểm yếu/issue phát hiện trong quá trình rà soát đã được nhóm trực tiếp fix trong mã nguồn và ghi nhận rõ ràng trong tài liệu này.",
                    "success"
                ),

                new Paragraph({ spacing: { before: 240, after: 120 }, children: [] }),

                // =========================================================================
                // CÂU 1
                // =========================================================================
                createH1("1", "Giải thích vì sao chọn kiến trúc này, nếu không theo hướng này thì có hướng xử lý nào khác không?"),
                
                createH2("1.1. Bối cảnh bài toán và lý do lựa chọn kiến trúc Microservices"),
                createP("Hệ thống quản lý nhà hàng ẩm thực không phải là một ứng dụng CRUD đơn giản, mà có các miền nghiệp vụ đối nghịch nhau về chu kỳ tải và tính sẵn sàng:"),
                createBullet(" Giờ ăn trưa (11h30 - 13h30) và giờ ăn tối (18h30 - 21h00), hàng trăm khách hàng đồng thời quét mã QR tại bàn để xem menu và đặt món; nhân viên quầy POS mở đơn liên tục. Luồng này đòi hỏi tốc độ phản hồi cực nhanh, chịu tải biến động mạnh.", "1. Tải truy cập biến động cực đoan theo khung giờ:"),
                createBullet(" Đòi hỏi cập nhật trạng thái món (ORDERED -> COOKING -> COOKED -> SERVED) theo thời gian thực (Real-time). Màn hình bếp tuyệt đối không được phép bị chậm, đơ hay gián đoạn chỉ vì kế toán đang chạy tổng hợp báo cáo tài chính cuối tháng.", "2. Màn hình Bếp (Kitchen Display System - KDS):"),
                createBullet(" Định mức tiêu hao nguyên vật liệu theo món (BOM - Bill of Materials) đòi hỏi tính toán phức tạp khi hoàn tất đơn hàng. Nghiệp vụ này có thể xử lý ngầm (Asynchronous Event-Driven) mà không được làm nghẽn luồng thanh toán tại quầy thu ngân.", "3. Quản lý kho và định mức công thức phức tạp:"),
                createBullet(" Nếu dịch vụ Báo cáo (Report Service) hoặc Kho (Inventory Service) gặp sự cố bảo trì, các chức năng sinh tử của nhà hàng (Gọi món tại bàn, chế biến tại bếp, in hóa đơn thu ngân) vẫn phải hoạt động bình thường 100%.", "4. Tính cô lập lỗi (Fault Isolation):"),

                createH2("1.2. Hiện thực hóa kiến trúc của nhóm trong dự án"),
                createP("Nhóm đã thiết kế hệ thống theo chuẩn kiến trúc hướng dịch vụ:"),
                createBullet(" Gồm 7 cơ sở dữ liệu MySQL chạy độc lập trên các container Docker (auth_db:3307, user_db:3308, menu_db:3309, inventory_db:3310, order_db:3311, table_db:3312, report_db:3313). Tuyệt đối không có service nào được phép query trực tiếp vào DB của service khác.", "• Database-per-Service:"),
                createBullet(" Quản lý tập trung mọi request từ Web/POS/Mobile, thực hiện kiểm tra JWT Token tại AuthenticationFilter và bảo vệ an toàn cho các dịch vụ bên dưới.", "• Spring Cloud API Gateway (Port 8080):"),
                createBullet(" Netflix Eureka Server (Port 8761) giúp các dịch vụ tự phát hiện địa chỉ IP/Port của nhau.", "• Service Discovery:"),
                createBullet(" Dùng OpenFeign cho các luồng cần phản hồi tức thời (Kiểm tra bàn trống, lấy giá món); Dùng RabbitMQ Event-Driven cho các luồng xử lý sau thanh toán (order.completed -> trừ kho; order.paid -> ghi nhận doanh thu).", "• Giao tiếp lai (Hybrid):"),

                createH2("1.3. Các hướng xử lý thay thế và so sánh đa chiều"),
                createTable(
                    ["Kiến Trúc", "Ưu Điểm Cốt Lõi", "Nhược Điểm / Rủi Ro", "Phù Hợp Khi Nào?"],
                    [
                        [
                            "Microservices\n(Lựa chọn của nhóm)",
                            "- Độc lập mở rộng (Scale riêng Order/POS)\n- Cô lập lỗi hoàn hảo (Fault Isolation)\n- Phân rã nghiệp vụ theo Domain rõ ràng",
                            "- Chi phí hạ tầng cao (cần Docker, RabbitMQ)\n- Xử lý giao dịch phân tán phức tạp\n- Độ trễ mạng (Network Latency) liên service",
                            "Chuỗi nhà hàng quy mô vừa và lớn, tải cao điểm biến động mạnh, cần tách biệt vận hành Bếp - Thu ngân - Báo cáo."
                        ],
                        [
                            "Modular Monolith\n(Spring Modulith)",
                            "- Rất dễ triển khai (1 file JAR, 1 Database)\n- Giao dịch ACID toàn vẹn trong 1 DB\n- Không có độ trễ mạng liên dịch vụ",
                            "- Không thể scale riêng từng module\n- Một lỗi rò rỉ bộ nhớ (OOM) làm sập cả hệ thống\n- Query nặng ở Report dễ lock bảng của POS",
                            "Giai đoạn khởi nghiệp (MVP), đội ngũ nhỏ (1-3 người), hệ thống nhà hàng đơn lẻ tải thấp."
                        ],
                        [
                            "Serverless FaaS\n(AWS Lambda / Cloud Run)",
                            "- Tự động co giãn theo từng request\n- Ban đêm đóng cửa chi phí bằng 0\n- Không cần quản trị server/container",
                            "- Độ trễ khởi động lạnh (Cold Start) làm chậm POS\n- Khó kiểm thử, chạy thử và debug trên máy local\n- Chi phí request cao khi chạy liên tục",
                            "Ứng dụng gọi món theo mùa vụ hoặc sự kiện lễ hội không cố định thời gian."
                        ],
                        [
                            "PHP Monolith Cũ\n(Hệ thống đối chứng)",
                            "- Đơn giản, viết mã nhanh chóng\n- Nạp lại trang truyền thống",
                            "- Spaghetti code, JOIN bảng chéo vô tội vạ\n- Bếp không có Realtime, nghẽn tải toàn diện",
                            "Mô hình học tập cổ điển, không đáp ứng chuẩn doanh nghiệp hiện đại."
                        ]
                    ],
                    [2200, 2600, 2600, 2000]
                ),

                new Paragraph({ spacing: { before: 240, after: 120 }, children: [] }),

                // =========================================================================
                // CÂU 2
                // =========================================================================
                createH1("2", "THỰC THỂ TRUNG TÂM trong bài là gì; XUẤT HIỆN Ở MODULE DỊCH VỤ NÀO MỖI NƠI CẦN THUỘC TÍNH GÌ?"),
                
                createH2("2.1. Xác định thực thể trung tâm cốt lõi"),
                createP("Trong hệ thống nhà hàng, có 2 thực thể đóng vai trò trung tâm:"),
                createBullet(" Đóng vai trò TRỤC XƯƠNG SỐNG NGHIỆP VỤ (Business Process Lifecycle). Mọi luồng hoạt động từ lúc khách ngồi vào bàn, đầu bếp nhận lệnh nấu, nhân viên kiểm kho xuất nguyên liệu, thu ngân thanh toán đến kế toán xem báo cáo đều xoay quanh vòng đời của Đơn hàng.", "1. Thực thể ĐƠN HÀNG (SaleOrder / Order):"),
                createBullet(" Đóng vai trò ĐỐI TƯỢNG TRAO ĐỔI NGHIỆP VỤ (Catalog Item) liên kết giữa Menu, Chi tiết đơn hàng và Công thức định mức kho.", "2. Thực thể MÓN ĂN (MenuItem):"),

                createH2("2.2. Sự phân bố của thực thể ĐƠN HÀNG (SaleOrder)"),
                createTable(
                    ["Dịch Vụ", "Bảng / Dữ Liệu Lưu Trữ", "Các Thuộc Tính Cần Thiết", "Mục Đích Sử Dụng Nghiệp Vụ"],
                    [
                        [
                            "order-service\n(Master Owner)",
                            "Bảng sale_order &\nsale_order_detail",
                            "id, table_id, waiter_id, cashier_id, order_time, status (OPEN, SERVED, PAID, CANCEL), subtotal, discount, vat_rate, total_amount, source (INTERNAL, QR), customer_name, customer_phone, note.\nDetails: menu_id, menu_name, qty, price, status (ORDERED, COOKING, COOKED, SERVED), note",
                            "Nắm toàn quyền quản lý vòng đời đơn hàng, hiển thị danh sách order, in hóa đơn, màn hình điều phối bếp KDS."
                        ],
                        [
                            "table-service",
                            "Bảng restaurant_table &\norder_token",
                            "order_token, status (FREE, OCCUPIED, RESERVED), table_id",
                            "Không lưu chi tiết món ăn hay giá tiền. Chỉ quản lý mã order_token để khách quét QR tạo đơn và gắn trạng thái bàn đang có khách (OCCUPIED) hoặc bàn trống (FREE)."
                        ],
                        [
                            "inventory-service",
                            "Event OrderCompletedEventDto\n-> Bảng inventory_issue",
                            "orderId (tham chiếu tại ghi chú phiếu xuất),\nitems: [{ menuId, qty }]",
                            "Nhận sự kiện qua RabbitMQ khi đơn xong/thanh toán. Chỉ quan tâm orderId để đối soát và danh sách menuId kèm số lượng để map sang công thức BOM trừ kho. Không quan tâm giá tiền, thuế hay thu ngân."
                        ],
                        [
                            "report-service",
                            "Bảng report_order_summary",
                            "id (chính là orderId), order_date, total_amount, status, table_number, cashier_name, source, synced_at",
                            "Lưu bản ghi tóm tắt (Denormalized Snapshot) nhận từ sự kiện order.paid. Dùng để tổng hợp doanh thu theo ngày, biểu đồ phân tích và tính toán KPI mà không cần JOIN sang DB khác."
                        ],
                        [
                            "notification-service",
                            "Event Consumer",
                            "orderId, tableNumber, status, totalAmount",
                            "Nhận thông báo để phát chuông/hiển thị popup trên màn hình Bếp và Thu ngân khi có đơn mới phát sinh."
                        ]
                    ],
                    [1800, 2000, 3200, 2400]
                ),

                createH2("2.3. Sự phân bố của thực thể MÓN ĂN (MenuItem)"),
                createTable(
                    ["Dịch Vụ", "Thuộc Tính Cần Thiết", "Giải Thích Thiết Kế Domain"],
                    [
                        [
                            "menu-service\n(Master Owner)",
                            "id, code, name, price, description, category, recipe: [{ ingredient_id, qty }]",
                            "Nơi duy nhất cho phép thêm, sửa, xóa món ăn và định nghĩa công thức định lượng (Bill of Materials)."
                        ],
                        [
                            "order-service",
                            "menu_id, menu_name (snapshot), price (snapshot tại lúc bán), qty, note, cooking_status",
                            "Lưu snapshot tên món và đơn giá tại thời điểm đặt để bảo đảm nếu sau này giá món trong menu-service thay đổi thì hóa đơn cũ vẫn giữ nguyên giá gốc."
                        ],
                        [
                            "inventory-service",
                            "menu_id (dùng làm key tra cứu công thức)",
                            "inventory-service gọi sang menu-service qua Feign getRecipesByMenuId(menuId) để lấy ra các ingredient_id tương ứng cần trừ."
                        ]
                    ],
                    [2200, 3400, 3800]
                ),

                new Paragraph({ spacing: { before: 240, after: 120 }, children: [] }),

                // =========================================================================
                // CÂU 3
                // =========================================================================
                createH1("3", "Chỉ ra 1 thay đổi nghiệp vụ buộc nhóm phải sửa nhiều dịch vụ kèm theo nhất, vì sao?"),
                
                createH2("3.1. Phân tích 2 trường hợp thay đổi nghiệp vụ kinh điển"),
                createH3("Trường hợp 1 (Sâu sắc nhất về cấu trúc nghiệp vụ bán hàng): Hỗ trợ Combo / Set món ăn & Món tùy biến (Toppings / Size)"),
                createP("Hiện tại, cấu trúc của hệ thống quy ước một dòng trong đơn hàng tương ứng 1-1 với một MenuItem cố định, và mỗi MenuItem có một Recipe cố định. Khi nhà hàng đưa ra nghiệp vụ Bán Combo (Ví dụ: Set Lẩu gồm 1 nồi lẩu, chọn 2 loại thịt, chọn 2 nước uống) hoặc Món kèm Topping:"),
                createBullet(" CSDL phải bổ sung bảng menu_combo_item, menu_option_group, sửa API tính giá động theo thành phần con được chọn.", "1. menu-service:"),
                createBullet(" Cấu trúc bảng sale_order_detail bị phá vỡ hoàn toàn. Không thể chỉ lưu menu_id đơn thuần mà phải lưu quan hệ phân cấp Cha-Con (Parent-Child Items). Bếp KDS phải tách từng món con để hiển thị cho các line chế biến khác nhau.", "2. order-service:"),
                createBullet(" Logic trừ kho tự động tại OrderCompletedConsumer bị vỡ: Phải phân rã các món con và topping được chọn, sau đó gọi Feign lấy recipe của từng món con để trừ kho.", "3. inventory-service:"),
                createBullet(" Phải sửa DTO PublicOrderSubmitRequest và giao diện điện thoại để khách quét QR có thể chọn các món con trong Combo.", "4. table-service & QR Order:"),
                createBullet(" Báo cáo doanh thu và top món bán chạy phải phân định rõ: tính doanh thu cho Combo cha hay tính số lượng tiêu hao cho từng món lẻ bên trong.", "5. report-service:"),
                createBullet(" Sửa toàn bộ giao diện từ Thực đơn, POS, KDS, Giỏ hàng QR đến Hóa đơn in ấn.", "6. Frontend (Toàn bộ):"),

                createH3("Trường hợp 2 (Toàn diện nhất về quy mô kiến trúc): Mở rộng chuỗi nhà hàng Đa Chi Nhánh (Multi-branch / Multi-tenant)"),
                createP("Nếu nhà hàng mở rộng thành chuỗi 10 chi nhánh với yêu cầu quản trị dữ liệu riêng biệt:"),
                createBullet(" Phải thêm branch_id vào Payload JWT Token, phân cấp quyền Admin Tổng vs Quản lý chi nhánh.", "1. auth-service & user-service:"),
                createBullet(" Bàn ăn, khu vực và mã QR phải thuộc về branch_id cụ thể.", "2. table-service:"),
                createBullet(" Bảng giá và món ăn khả dụng có thể khác nhau theo từng chi nhánh (branch_menu_item).", "3. menu-service:"),
                createBullet(" Kho nguyên liệu và tồn kho phải hoàn toàn độc lập theo chi nhánh.", "4. inventory-service:"),
                createBullet(" Đơn hàng POS, vé bếp KDS phải gắn chặt với branch_id.", "5. order-service:"),
                createBullet(" Báo cáo doanh thu, chi phí, lợi nhuận phân rã theo từng chi nhánh và toàn chuỗi.", "6. report-service:"),
                createBullet(" Phải kiểm tra và đính kèm header X-Branch-Id vào mọi request downstream.", "7. api-gateway:"),

                ...createCallout(
                    "KẾT LUẬN VỀ TÍNH KẾT NỐI (COUPLING)",
                    "Dù là kiến trúc Microservices phân tán, khi một thay đổi chạm vào CẤU TRÚC PHÂN CẤP CỦA THỰC THỂ TRUNG TÂM (như Combo/Topping) hoặc CHIỀU PHÂN TẦNG DỮ LIỆU (như Multi-branch), hiệu ứng gợn sóng (Ripple Effect) sẽ buộc 100% các microservices và giao diện người dùng phải sửa đổi đồng loạt.",
                    "warning"
                ),

                new Paragraph({ spacing: { before: 240, after: 120 }, children: [] }),

                // =========================================================================
                // CÂU 4
                // =========================================================================
                createH1("4", "Nếu có 1 thao tác cập nhật dữ liệu ở nhiều nơi bước thứ 2 lỗi thì phải update như thế nào?"),
                
                createH2("4.1. Rà soát thực trạng ban đầu trong mã nguồn dự án"),
                createP("Trong mã nguồn ban đầu, kịch bản cập nhật phân tán xuất hiện tại chức năng Tạo đơn hàng (createOrder) trong OrderServiceImpl.java:"),
                createBullet(" Lưu đơn hàng SaleOrder và chi tiết vào order_db (@Transactional).", "• Bước 1:"),
                createBullet(" Gọi Feign tableClient.updateTableStatus(request.getTableId(), \"OCCUPIED\") sang table-service.", "• Bước 2:"),
                createP("Nhược điểm ban đầu: Khối lệnh Bước 2 bọc trong try-catch và chỉ ghi log.error. Nếu Bước 2 thất bại, ngoại lệ bị nuốt, đơn hàng vẫn commit OPEN nhưng bàn vẫn FREE -> Bất nhất dữ liệu (Dual-write Inconsistency)."),

                createH2("4.2. Giải pháp chuẩn kiến trúc: Saga Pattern & Local Transaction Rollback"),
                createBullet(" Đơn hàng tạo ở trạng thái PENDING_TABLE, bắn event sang RabbitMQ. table-service chiếm bàn; nếu thất bại thì bắn event ngược lại để order-service thực hiện giao dịch bù trừ (hủy đơn và báo người dùng).", "1. Saga Pattern (Compensating Transaction):"),
                createBullet(" Trong luồng gọi đồng bộ qua Feign, không được nuốt ngoại lệ. Khi Bước 2 ném FeignException, để ngoại lệ lan truyền ra ngoài Service method. Annotation @Transactional của Spring sẽ tự động ROLLBACK toàn bộ dữ liệu vừa lưu trong order_db.", "2. Local Rollback upon Feign Exception:"),
                createBullet(" Lưu đơn và event vào cùng 1 bảng outbox_events. Background poller sẽ retry bắn sự kiện cho đến khi thành công.", "3. Transactional Outbox Pattern:"),

                createH2("4.3. Cải tiến nhóm đã cập nhật trực tiếp vào mã nguồn"),
                createP("Nhóm đã cập nhật phương thức createOrder trong OrderServiceImpl.java (dòng 146-158):"),
                ...createCodeBlock([
                    "// File: backend/order-service/.../service/impl/OrderServiceImpl.java",
                    "if (request.getTableId() != null) {",
                    "    try {",
                    "        ApiResponse<TableDto> tableResp = tableClient.updateTableStatus(",
                    "            request.getTableId(), TableStatusDto.builder().status(\"OCCUPIED\").build());",
                    "        if (tableResp == null || tableResp.getData() == null) {",
                    "            throw new ConflictException(\"Không thể chiếm bàn: Dịch vụ bàn không phản hồi hợp lệ\");",
                    "        }",
                    "    } catch (ConflictException ce) {",
                    "        throw ce; // Lan truyền ngoại lệ để Spring @Transactional tự động ROLLBACK",
                    "    } catch (Exception e) {",
                    "        log.error(\"Failed to set table occupied: {}\", e.getMessage());",
                    "        throw new ConflictException(\"Không thể chiếm bàn #\" + request.getTableId() + ",
                    "            \": \" + e.getMessage() + \". Đơn hàng đã được tự động hoàn tác để đảm bảo toàn vẹn dữ liệu.\");",
                    "    }",
                    "}"
                ]),
                ...createCallout(
                    "KẾT QUẢ FIX MÃ NGUỒN",
                    "Bằng việc ném ConflictException kế thừa từ RuntimeException, Spring Transaction Manager sẽ bắt được ngoại lệ và kích hoạt ROLLBACK toàn bộ đơn hàng trong order_db. Đơn hàng không bao giờ bị lưu mồ côi nếu bước chiếm bàn thất bại!",
                    "success"
                ),

                new Paragraph({ spacing: { before: 240, after: 120 }, children: [] }),

                // =========================================================================
                // CÂU 5
                // =========================================================================
                createH1("5", "2 người cùng giành 1 chỗ cuối cùng thì nhóm xử lý như thế nào?"),
                
                createH2("5.1. Rà soát nguy cơ Race Condition ban đầu"),
                createP("Ban đầu, hệ thống kiểm tra tình trạng bàn bằng cơ chế 'Check-then-Act' không có khóa (Locking):"),
                createBullet(" Thread A và Thread B cùng đọc DB tại một phần nghìn giây và đều thấy bàn FREE.", "• Thời điểm T1:"),
                createBullet(" Cả hai cùng tạo đơn hàng và cùng gửi lệnh UPDATE bàn sang OCCUPIED.", "• Thời điểm T2:"),
                createBullet(" Cả hai khách hàng đều tưởng mình giữ bàn thành công -> Xung đột 2 khách chung 1 bàn.", "• Kết quả:"),

                createH2("5.2. Giải pháp và Cải tiến nhóm đã cập nhật trực tiếp vào mã nguồn"),
                createH3("1. Triển khai Khóa Lạc Quan (Optimistic Locking) với `@Version` trên `RestaurantTable`"),
                createP("Nhóm đã bổ sung trường @Version vào entity RestaurantTable.java và cập nhật schema CSDL:"),
                ...createCodeBlock([
                    "// File: backend/table-service/.../entity/RestaurantTable.java",
                    "@Version",
                    "@Column(name = \"version\")",
                    "@Builder.Default",
                    "private Long version = 0L;"
                ]),
                createP("Cơ chế: Khi 2 request cùng đọc version = 1, request đầu tiên update thành công sẽ tăng version lên 2. Request thứ 2 gửi update với version = 1 sẽ bị 0 rows affected, Hibernate văng ObjectOptimisticLockingFailureException."),

                createH3("2. Xử lý ngoại lệ xung đột đồng thời tại GlobalExceptionHandler.java"),
                ...createCodeBlock([
                    "// File: backend/table-service/.../exception/GlobalExceptionHandler.java",
                    "@ExceptionHandler(org.springframework.orm.ObjectOptimisticLockingFailureException.class)",
                    "public ResponseEntity<ErrorResponse> handleOptimisticLock(Exception ex, HttpServletRequest req) {",
                    "    ErrorResponse err = ErrorResponse.builder()",
                    "            .status(HttpStatus.CONFLICT.value())",
                    "            .error(HttpStatus.CONFLICT.getReasonPhrase())",
                    "            .message(\"Xung đột đồng thời: Bàn ăn vừa có thay đổi hoặc đã được người khác đặt trước. Vui lòng thử lại.\")",
                    "            .path(req.getRequestURI())",
                    "            .timestamp(LocalDateTime.now())",
                    "            .build();",
                    "    return ResponseEntity.status(HttpStatus.CONFLICT).body(err);",
                    "}"
                ]),

                createH3("3. Kiểm tra trạng thái bàn nghiêm ngặt tại TableServiceImpl.java"),
                ...createCodeBlock([
                    "// File: backend/table-service/.../service/impl/TableServiceImpl.java",
                    "if (status == TableStatus.OCCUPIED && table.getStatus() != TableStatus.FREE) {",
                    "    throw new ConflictException(\"Bàn \" + table.getNumber() + \" hiện không ở trạng thái trống (trạng thái: \" + table.getStatus() + \")\");",
                    "}"
                ]),

                new Paragraph({ spacing: { before: 240, after: 120 }, children: [] }),

                // =========================================================================
                // CÂU 6
                // =========================================================================
                createH1("6", "Giả sử A login tài khoản, đổi id thành B để xem dữ liệu của B thì điều gì xảy ra, nhóm xử lý vấn đề này như thế nào?"),
                
                createH2("6.1. Phân tích các kịch bản tấn công"),
                createBullet(" Chữ ký Signature HMAC-SHA256 không khớp -> jwtUtil.validateToken ném SignatureException -> Gateway trả về HTTP 401 Unauthorized ngay lập tức.", "• Kịch bản 1: A tự sửa payload JWT:", "info"),
                createBullet(" Gateway bóc tách claims từ JWT hợp lệ và inject vào request downstream. Tuy nhiên, nếu không xóa header client gửi lên trước thì kẻ tấn công có thể lợi dụng kẽ hở.", "• Kịch bản 2: A tự chèn header X-User-Id bằng Postman:"),
                createBullet(" A truyền id của người khác trên URL như GET /api/users/2.", "• Kịch bản 3: A khai thác lỗ hổng IDOR (Insecure Direct Object Reference):"),

                createH2("6.2. Cải tiến bảo mật nhóm đã cập nhật trực tiếp vào mã nguồn"),
                createH3("1. Khử độc Header (Header Sanitization) và kiểm tra cờ Active tại `AuthenticationFilter.java`"),
                createP("Nhóm đã cập nhật bộ lọc AuthenticationFilter.java tại API Gateway:"),
                ...createCodeBlock([
                    "// File: backend/api-gateway/.../filter/AuthenticationFilter.java",
                    "var claims = jwtUtil.extractAllClaims(token);",
                    "",
                    "// Kiểm tra tài khoản có bị khóa không",
                    "Object activeClaim = claims.get(\"active\");",
                    "if (activeClaim != null && \"false\".equalsIgnoreCase(String.valueOf(activeClaim))) {",
                    "    exchange.getResponse().setStatusCode(HttpStatus.FORBIDDEN);",
                    "    return exchange.getResponse().setComplete();",
                    "}",
                    "",
                    "// Xóa sạch toàn bộ header giả mạo từ client, sau đó mới nạp claims đã ký",
                    "ServerHttpRequest modifiedRequest = request.mutate()",
                    "        .headers(httpHeaders -> {",
                    "            httpHeaders.remove(\"X-User-Id\");",
                    "            httpHeaders.remove(\"X-User-Username\");",
                    "            httpHeaders.remove(\"X-User-Role\");",
                    "            httpHeaders.remove(\"X-User-Fullname\");",
                    "        })",
                    "        .header(\"X-User-Id\", String.valueOf(claims.get(\"id\")))",
                    "        .header(\"X-User-Username\", String.valueOf(claims.get(\"username\")))",
                    "        .header(\"X-User-Role\", String.valueOf(claims.get(\"role\")))",
                    "        .header(\"X-User-Fullname\", String.valueOf(claims.get(\"fullname\")))",
                    "        .build();"
                ]),

                createH3("2. Kiểm tra quyền sở hữu IDOR và bổ sung endpoint `/api/users/me` tại `UserController.java`"),
                ...createCodeBlock([
                    "// File: backend/user-service/.../controller/UserController.java",
                    "@GetMapping(\"/me\")",
                    "public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(",
                    "        @RequestHeader(value = UserConstants.HEADER_USER_ID) String currentUserId) {",
                    "    UserResponse response = userService.getUserById(Long.parseLong(currentUserId));",
                    "    return ResponseEntity.ok(ApiResponse.ok(response, \"Current user found\"));",
                    "}",
                    "",
                    "@GetMapping(\"/{id}\")",
                    "public ResponseEntity<ApiResponse<UserResponse>> getUserById(",
                    "        @PathVariable Long id,",
                    "        @RequestHeader(value = UserConstants.HEADER_USER_ID, required = false) String currentUserIdHeader,",
                    "        @RequestHeader(value = UserConstants.HEADER_USER_ROLE, required = false) String currentUserRole) {",
                    "    // IDOR protection: Người dùng không phải ADMIN chỉ được xem dữ liệu của chính mình",
                    "    if (currentUserRole != null && !\"ADMIN\".equalsIgnoreCase(currentUserRole)) {",
                    "        if (currentUserIdHeader == null || !id.toString().equals(currentUserIdHeader)) {",
                    "            throw new ForbiddenException(\"Bạn không có quyền truy cập thông tin của tài khoản khác.\");",
                    "        }",
                    "    }",
                    "    UserResponse response = userService.getUserById(id);",
                    "    return ResponseEntity.ok(ApiResponse.ok(response, \"User found\"));",
                    "}"
                ]),

                new Paragraph({ spacing: { before: 240, after: 120 }, children: [] }),

                // =========================================================================
                // CÂU 7
                // =========================================================================
                createH1("7", "Làm sao để thu hồi quyền 1 người khi token còn hạn?"),
                
                createH2("7.1. Hạn chế cố hữu của Stateless JWT"),
                createP("Do JWT là phi trạng thái (Stateless), một khi token đã được ký và cấp phát thì phía server không thể chủ động hủy nếu không có cơ chế phụ trợ. Nếu nhân viên bị đổi quyền hoặc bị khóa tài khoản, token cũ vẫn có hiệu lực cho đến khi hết hạn exp."),

                createH2("7.2. Các giải pháp thu hồi quyền tức thời chuẩn công nghiệp"),
                createTable(
                    ["Giải Pháp", "Cơ Chế Kỹ Thuật", "Ưu Điểm", "Nhược Điểm"],
                    [
                        [
                            "1. Redis Token Blacklist\n(Danh sách đen Token)\n[Khuyên Dùng]",
                            "- Mỗi JWT có mã định danh duy nhất (jti - JWT ID).\n- Khi Admin khóa tài khoản hoặc User đăng xuất: auth-service đẩy jti vào Redis với TTL = Thời gian sống còn lại của token.\n- Tại Gateway: Sau khi kiểm tra JWT hợp lệ, kiểm tra nhanh Redis: if (redis.exists(\"bl:\" + jti)) return 401.",
                            "- Thu hồi tức thì (Real-time Revocation)\n- Tốc độ tra cứu Redis in-memory cực nhanh (<1ms)\n- Tự động xóa khỏi bộ nhớ khi token hết hạn nhờ TTL",
                            "- Cần bổ sung Redis vào hạ tầng Gateway"
                        ],
                        [
                            "2. Token Versioning\n(Phiên bản hóa Token)",
                            "- Bảng users có thêm cột token_version INT DEFAULT 1.\n- Payload của JWT lưu kèm \"ver\": 1.\n- Khi đổi quyền/khóa tài khoản: UPDATE users SET token_version = token_version + 1.\n- Gateway/Service cache giá trị token_version mới nhất. Nếu ver trong token < ver hiện tại -> Từ chối.",
                            "- Một thao tác tăng version có thể vô hiệu hóa cùng lúc TẤT CẢ các thiết bị đang đăng nhập của người đó.",
                            "- Vẫn cần cache để tránh query DB liên tục"
                        ],
                        [
                            "3. Short-lived Access Token\n+ Refresh Token\n(Chuẩn OAuth2)",
                            "- Access Token chỉ có thời hạn cực ngắn: 5 - 15 phút.\n- Refresh Token có thời hạn dài (7 ngày) nhưng được lưu cố định trong DB/Redis có cờ is_revoked.\n- Khi thu hồi quyền: Đánh dấu Refresh Token là revoked.",
                            "- Độ trễ rủi ro tối đa chỉ bằng thời gian sống của Access Token (5-15 phút mà không cần Blacklist phức tạp).",
                            "- Client phải tự động gọi API refresh token ngầm liên tục"
                        ]
                    ],
                    [2200, 3600, 2000, 1600]
                ),

                new Paragraph({ spacing: { before: 240, after: 120 }, children: [] }),

                // =========================================================================
                // CÂU 8
                // =========================================================================
                createH1("8", "Từ người dùng thông qua dịch vụ A gọi sang dịch vụ B; nếu B phản hồi chậm thì dịch vụ A và người dùng thấy gì?"),
                
                createH2("8.1. Hiện tượng xảy ra khi không cấu hình timeout"),
                createTable(
                    ["Đối Tượng", "Hiện Tượng Xảy Ra", "Bản Chất Kỹ Thuật"],
                    [
                        [
                            "Dịch Vụ A\n(order-service)",
                            "1. Cạn kiệt luồng (Thread Starvation):\nWorker thread của Tomcat bị giữ ở trạng thái blocked chờ socket đọc dữ liệu từ B.\n2. Hiệu ứng sập domino (Cascading Failure):\nNhiều người dùng cùng gọi làm cạn sạch 200 luồng của Tomcat pool. Dịch vụ A tê liệt hoàn toàn, không thể tiếp nhận thêm bất kỳ request nào khác dù các chức năng khác không liên quan đến B.\n3. Ném ngoại lệ Feign.RetryableException sau khi hết thời gian chờ Read Timeout.",
                            "Khối lệnh bọc try-catch của A bắt được lỗi, ghi log.warn, sau đó tiếp tục chạy tiếp (tạo đơn không có thông tin bàn). Nhưng quá trình chờ đợi 60s đã gây tắc nghẽn toàn bộ tài nguyên CPU/Thread."
                        ],
                        [
                            "Người Dùng\n(Frontend Client)",
                            "1. Trải nghiệm đơ/treo:\nNút bấm hiển thị vòng xoay tải trang (Spinner) quay liên tục trong suốt 10-60 giây.\n2. Nếu Gateway có timeout:\nNgười dùng nhận mã lỗi HTTP 504 Gateway Timeout từ Spring Cloud Gateway.\n3. Nếu Axios ở Frontend có timeout (ví dụ 10s):\nAxios ném lỗi ECONNABORTED, UI hiện thông báo lỗi: 'Yêu cầu quá hạn, máy chủ không phản hồi'.\n4. Nếu không ngắt timeout:\nSau 60 giây người dùng mới thấy kết quả, gây ức chế trải nghiệm cực kỳ nghiêm trọng.",
                            "Người dùng tưởng hệ thống bị treo, bấm nút 'Tạo đơn' liên tục nhiều lần -> Vô tình tạo ra cơn bão request (Retry Storm) làm sập hệ thống nhanh hơn."
                        ]
                    ],
                    [2000, 4400, 3000]
                ),

                createH2("8.2. Cải tiến nhóm đã cập nhật trực tiếp vào mã nguồn"),
                createP("Nhóm đã cấu hình chặt chẽ thời gian chờ cho OpenFeign trong file application.yml của order-service và inventory-service:"),
                ...createCodeBlock([
                    "# File: backend/order-service/src/main/resources/application.yml",
                    "# & backend/inventory-service/src/main/resources/application.yml",
                    "feign:",
                    "  client:",
                    "    config:",
                    "      default:",
                    "        connectTimeout: 3000   # 3 giây kết nối",
                    "        readTimeout: 5000      # 5 giây đọc dữ liệu (thay vì 60s mặc định)",
                    "        loggerLevel: basic"
                ]),
                createP("Nhờ cấu hình này, nếu dịch vụ B bị chậm quá 5 giây, kết nối sẽ được ngắt dứt khoát, giải phóng Tomcat worker thread ngay lập tức, ngăn chặn hoàn toàn hiệu ứng cạn kiệt luồng và sập lan truyền."),

                new Paragraph({ spacing: { before: 240, after: 120 }, children: [] }),

                // =========================================================================
                // CÂU 9
                // =========================================================================
                createH1("9", "Nếu 1 dịch vụ nhận trùng 1 thông điệp 2 lần thì có sinh dữ liệu trùng hay không?"),
                
                createH2("9.1. Rà soát thực tế ban đầu: Nguy cơ sinh trùng"),
                createP("Trước khi sửa đổi: Khi nhận trùng sự kiện order.completed tại OrderCompletedConsumer.java, hệ thống luôn luôn INSERT mới một InventoryIssue và INSERT thêm bản ghi số âm vào inventory_log -> DẪN TỚI TỒN KHO BỊ TRỪ GẤP ĐÔI!"),

                createH2("9.2. Cải tiến nhóm đã cập nhật trực tiếp vào mã nguồn"),
                createH3("1. Xây dựng Idempotent Consumer khử trùng tại `OrderCompletedConsumer.java`"),
                createP("Nhóm đã bổ sung hàm kiểm tra `existsByOrderTag` trong `InventoryIssueRepository` và chặn trùng lặp tại Consumer:"),
                ...createCodeBlock([
                    "// File: backend/inventory-service/.../messaging/OrderCompletedConsumer.java",
                    "@RabbitListener(queues = InventoryConstants.QUEUE_ORDER_COMPLETED)",
                    "@Transactional",
                    "public void handleOrderCompleted(OrderCompletedEventDto event) {",
                    "    log.info(\"Received order.completed event for order id: {}\", event.getOrderId());",
                    "    if (event.getItems() == null || event.getItems().isEmpty()) return;",
                    "",
                    "    // KHỬ TRÙNG THÔNG ĐIỆP (IDEMPOTENCY DEDUPLICATION CHECK)",
                    "    String orderTag = \"order #\" + event.getOrderId();",
                    "    if (issueRepository.existsByOrderTag(orderTag)) {",
                    "        log.warn(\"Order completed event for order #{} has already been processed. \" +",
                    "                 \"Deduplication check triggered: skipping to prevent duplicate inventory deduction.\", ",
                    "                 event.getOrderId());",
                    "        return; // BỎ QUA, KHÔNG TRỪ KHO THÊM LẦN NỮA",
                    "    }",
                    "",
                    "    // Tạo phiếu xuất kho kèm orderTag duy nhất",
                    "    InventoryIssue issue = InventoryIssue.builder()",
                    "            .issueType(IssueType.SALE)",
                    "            .issueDate(LocalDate.now())",
                    "            .status(IssueStatus.COMPLETED)",
                    "            .note(\"Auto issue from completed \" + orderTag)",
                    "            .build();",
                    "    InventoryIssue savedIssue = issueRepository.save(issue);",
                    "    ...",
                    "}"
                ]),

                createH3("2. Xử lý Upsert Snapshot Lũy Kế tại `ReportEventConsumer.java`"),
                createP("Nhóm đã cập nhật phương thức handleStockUpdated trong report-service để tìm kiếm snapshot theo (ingredientId, snapshotDate) trước khi lưu. Nếu đã có thì cập nhật số lượng thay vì INSERT thêm dòng mới, đảm bảo tính lũy kế (Idempotent)."),

                new Paragraph({ spacing: { before: 240, after: 120 }, children: [] }),

                // =========================================================================
                // CÂU 10
                // =========================================================================
                createH1("10", "Chỉ ra 1 đặc điểm/chức năng nhóm biết là chưa tốt nhưng cố tình để lại. Nếu còn thời gian, nhóm sửa gì trước, vì sao?"),
                
                createH2("10.1. Đặc điểm nhóm đã nhận diện"),
                ...createCallout(
                    "CÁC ĐẶC ĐIỂM CHƯA HOÀN THIỆN BAN ĐẦU",
                    "Hệ thống ban đầu sử dụng mô hình Best-effort Delivery: Consumer trừ kho chưa có khử trùng thông điệp (Idempotency), tạo đơn gọi sang chiếm bàn chưa có cơ chế rollback giao dịch, thiếu Optimistic Locking chống giành bàn và thiếu timeout chặt chẽ cho OpenFeign.",
                    "critical"
                ),

                createH2("10.2. Vì sao nhóm từng để lại trong giai đoạn đầu?"),
                createBullet(" Đồ án môn học diễn ra trong một khoảng thời gian có hạn (vài tuần). Mục tiêu cốt lõi của môn học SOA là hiện thực hóa thành công mô hình phân rã dịch vụ, chuẩn hóa giao tiếp liên dịch vụ (Sync OpenFeign + Async RabbitMQ), kiến trúc Database-per-Service và hệ thống UI SPA hoàn chỉnh.", "1. Sự đánh đổi giữa Phạm vi & Thời gian (Scope vs Time Trade-off):"),
                createBullet(" Nhóm ưu tiên hoàn thiện luồng nghiệp vụ chạy trôi chảy từ đầu đến cuối: Khách quét QR gọi món -> KDS bếp cập nhật -> Ra món -> POS in hóa đơn -> Kho tự trừ -> Báo cáo tài chính hiển thị KPI.", "2. Ưu tiên trải nghiệm người dùng hoàn chỉnh:"),
                createBullet(" Hạn chế tài nguyên phần cứng máy tính sinh viên khi phải chạy đồng thời 8 container dịch vụ.", "3. Giới hạn tài nguyên thử nghiệm:"),

                createH2("10.3. Nhóm đã hành động sửa chữa những gì và tại sao?"),
                createP("Nhận thức sâu sắc tính chất nghiêm trọng của các vấn đề trên, nhóm KHÔNG DỪNG LẠI Ở LÝ THUYẾT mà ĐÃ TRỰC TIẾP SỬA VÀ HOÀN THIỆN MÃ NGUỒN CỦA DỰ ÁN:"),
                createBullet(" Đã bổ sung existsByOrderTag tại OrderCompletedConsumer.java, loại bỏ hoàn toàn rủi ro trừ trùng kho khi RabbitMQ redelivery.", "1. ĐÃ FIX: Idempotent Consumer cho inventory-service (Ưu tiên số 1):", "success"),
                createBullet(" Đã bổ sung @Version vào RestaurantTable.java và bắt ObjectOptimisticLockingFailureException tại GlobalExceptionHandler.java.", "2. ĐÃ FIX: Optimistic Locking chống tranh chấp bàn ăn:", "success"),
                createBullet(" Đã sửa createOrder trong OrderServiceImpl.java: ném ConflictException để Spring @Transactional kích hoạt rollback đơn hàng nếu bước chiếm bàn thất bại.", "3. ĐÃ FIX: Xử lý lỗi bước thứ 2 (Local Transactional Rollback):", "success"),
                createBullet(" Đã cấu hình connectTimeout 3s và readTimeout 5s trong application.yml của order-service và inventory-service.", "4. ĐÃ FIX: Cấu hình Feign Timeout chống cạn kiệt luồng (Thread Starvation):", "success"),
                createBullet(" Đã bổ sung khử độc header tại AuthenticationFilter.java, thêm endpoint /api/users/me và kiểm tra IDOR ownership tại UserController.java.", "5. ĐÃ FIX: Khử độc Header và chống IDOR tại API Gateway & User Service:", "success")
            ]
        }]
    });

    const outputPath = path.resolve("D:/Work/Study/HDV/restaurant-microservices/GIAI_DAP_BAO_VE_MON_HOC_SOA_MICROSERVICES.docx");
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(outputPath, buffer);
    console.log("Document successfully written to:", outputPath);
}

buildDoc().catch(err => {
    console.error("Error building document:", err);
    process.exit(1);
});
