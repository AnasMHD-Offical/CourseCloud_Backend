import enrollment_model from "../models/enrollment.js"
import PDFDocument from "pdfkit-table";
import ExcelJS from "exceljs";

const get_sales_report = async (req, res) => {
    try {
        const { startDate, endDate, timeline } = req.query
        let start, end;
        if (startDate && endDate) {
            start = new Date(startDate);
            end = new Date(endDate);
        } else {
            // Define the default start date based on the period
            switch (timeline) {
                case "yearly":
                    start = new Date(new Date().setFullYear(new Date().getFullYear() - 1));
                    break;
                case "monthly":
                    start = new Date(new Date().setMonth(new Date().getMonth() - 1));
                    break;
                case "weekly":
                    start = new Date(new Date().setDate(new Date().getDate() - 7));
                    break;
                default:
                    throw new Error("Invalid period. Use 'yearly', 'monthly', 'weekly', or provide a date range.");
            }
            end = new Date(); // Default end date is today
        }
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || Infinity

        const revenueData = await enrollment_model.find({
            date_of_purchase: { $gt: start, $lt: end }
        }).populate("student_id", { name: 1 }).populate({ path: "course_id", populate: { path: "instructor_id", model: "instructor" } }).skip(page === 1 ? 0 : (page - 1) * limit).limit(limit)

        const total_reports = await enrollment_model.countDocuments({
            date_of_purchase: { $gt: start, $lt: end }
        })
        if (revenueData) {
            res.status(200)
                .json({ message: "Sales report fetched successfully", success: true, sales_report: revenueData, total_reports: total_reports })
        } else {
            res.status(400)
                .json({ message: "Unexpected error occurs while fetching sales report ", success: false })
        }

    } catch (error) {
        res.status(500)
            .json({ message: "Something went Wrong", success: false, error: error.message })
    }
}

const get_sales_report_data = async (startDate, endDate, timeline) => {
    let start, end;
    if (startDate && endDate) {
        start = new Date(startDate);
        end = new Date(endDate);
    } else {
        // Define the default start date based on the period
        switch (timeline) {
            case "yearly":
                start = new Date(new Date().setFullYear(new Date().getFullYear() - 1));
                break;
            case "monthly":
                start = new Date(new Date().setMonth(new Date().getMonth() - 1));
                break;
            case "weekly":
                start = new Date(new Date().setDate(new Date().getDate() - 7));
                break;
            default:
                throw new Error("Invalid period. Use 'yearly', 'monthly', 'weekly', or provide a date range.");
        }
        end = new Date(); // Default end date is today
    }

    const revenueData = await enrollment_model.find({
        date_of_purchase: { $gt: start, $lt: end }
    }).populate("student_id", { name: 1 })

    return revenueData
}


const download_sales_report_pdf = async (req, res) => {
    try {
        const { startDate, endDate, timeline } = req.query;

        // Fetch report data
        const reports = await get_sales_report_data(startDate, endDate, timeline);

        if (!reports || reports.length === 0) {
            return res.status(404).json({
                message: "No sales report data found for the given parameters.",
                success: false,
            });
        }

        // Initialize PDF document
        const pdfDoc = new PDFDocument({ margin: 50, size: "A4" });

        // Attach an error listener to the stream
        pdfDoc.on("error", (err) => {
            console.error("PDF generation error:", err);
            if (!res.headersSent) {
                res.status(500).end("Error generating PDF.");
            }
        });

        // Set response headers
        res.setHeader("Content-Disposition", "attachment; filename=sales_report.pdf");
        res.setHeader("Content-Type", "application/pdf");

        // Pipe PDF to response
        pdfDoc.pipe(res);

        // Add report content to PDF
        pdfDoc.fontSize(20).text("Sales Report", { align: "center" }).moveDown(2);

        for (let index = 0; index < reports.length; index++) {
            const report = reports[index];

            if (pdfDoc.y > 700) {
                pdfDoc.addPage();
            }

            pdfDoc.fontSize(14).font("Helvetica-Bold");
            pdfDoc.text(`Report ${index + 1}:`).moveDown(0.5);

            pdfDoc.fontSize(10).font("Helvetica");
            pdfDoc.text(`Date of Purchase: ${new Date(report?.date_of_purchase).toLocaleDateString()}`);
            pdfDoc.text(`Customer Name: ${report?.student_id?.name}`);
            pdfDoc.text(`Payment Method: ${report?.payment_method}`);
            pdfDoc.text(`Transaction ID: ${report?.transaction_id}`).moveDown(0.5);

            // Product table
            try {
                const table = {
                    title: "Product Details",
                    headers: ["Purchased Course Id", "Total Price (RS)"],
                    rows: [
                        [report?.course_id || "N/A", report?.course_price || "0"],
                    ],
                };

                await pdfDoc.table(table, {
                    prepareHeader: () => pdfDoc.font("Helvetica-Bold").fontSize(8),
                    prepareRow: (row, i) => pdfDoc.font("Helvetica").fontSize(8),
                    width: 500,
                });
            } catch (err) {
                console.error("Error in table rendering:", err);
                pdfDoc.text("Error rendering table data").moveDown();
            }

            pdfDoc.moveDown(0.5);
            pdfDoc
                .font("Helvetica-Bold")
                .fontSize(10)
                .text(
                    `Final Amount: RS. ${report?.course_price
                        ? parseFloat(report.course_price).toFixed(2)
                        : "0"
                    }`
                );
            pdfDoc.moveDown();
        }

        // Finalize the PDF
        pdfDoc.end();
    } catch (error) {
        console.error("Unexpected error:", error);
        if (!res.headersSent) {
            res.status(500).json({
                message: "Something went wrong",
                success: false,
                error: error.message,
            });
        }
    }
};

const download_sales_report_excel = async (req, res) => {
    try {
        const { startDate, endDate, timeline } = req.query;
        const reports = await get_sales_report_data(startDate, endDate, timeline);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Sales Report");

        worksheet.columns = [
            { header: "Purchased Course Id", key: "PurchasedCourseid", width: 25 },
            { header: "Total Price", key: "totalPrice", width: 15 },
            { header: "Final Amount", key: "finalAmount", width: 15 },
            { header: "Date of Purchase", key: "dop", width: 20 },
            { header: "Customer Name", key: "customer_name", width: 20 },
            { header: "Payment Method", key: "paymentMethod", width: 20 },
        ];

        reports.forEach((report) => {
            worksheet.addRow({
                PurchasedCourseid: report?.course_id,
                totalPrice: report?.course_price
                    ? parseFloat(report.course_price).toFixed(2)
                    : 0,
                finalAmount: report?.course_price
                    ? parseFloat(report.course_price).toFixed(2)
                    : 0,
                dop: report?.date_of_purchase.toLocaleDateString(),
                customer_name: report?.student_id?.name,
                paymentMethod: report?.payment_method,
            });
        });


        res.setHeader(
            "Content-Disposition",
            "attachment; filename=sales_report.xlsx"
        );
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error("Unexpected error:", error);
        if (!res.headersSent) {
            res.status(500).json({
                message: "Something went wrong",
                success: false,
                error: error.message,
            });
        }
    }
}


export {
    get_sales_report,
    download_sales_report_pdf,
    download_sales_report_excel
}