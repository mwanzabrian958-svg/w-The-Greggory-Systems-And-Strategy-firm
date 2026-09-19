import React, { useState, useEffect } from "react";
import { getApiUrl } from "../services/api";
import {
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Download,
  Eye,
  Calendar,
  TrendingUp,
  TrendingDown,
  FileText,
  FolderOpen,
  Users,
  Search,
  Filter,
  ChevronDown,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  BarChart3,
  PieChart,
  Receipt,
  CreditCard,
  Lock,
} from "lucide-react";

const FinancialManagement = ({
  entries,
  categories,
  periods,
  reports,
  invoices: invoicesProp,
  mpesaTransactions: mpesaProp,
  quotes: quotesProp,
  projects,
  selectedProject,
  setSelectedProject,
  onRefresh,
}) => {
  const [activeSection, setActiveSection] = useState("entries");
  const [showAddEntryForm, setShowAddEntryForm] = useState(false);
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false);
  const [showAddPeriodForm, setShowAddPeriodForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showEntryDetails, setShowEntryDetails] = useState(false);

  // Invoice Management State
  const [invoices, setInvoices] = useState(invoicesProp || []);
  const [mpesaTransactions, setMpesaTransactions] = useState(mpesaProp || []);
  const [showAddInvoiceForm, setShowAddInvoiceForm] = useState(false);
  const [showInvoiceDetails, setShowInvoiceDetails] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentInvoice, setSelectedPaymentInvoice] = useState(null);

  // Quotes Management State
  const [quotes, setQuotes] = useState(quotesProp || []);
  const [showAddQuoteForm, setShowAddQuoteForm] = useState(false);
  const [showQuoteDetails, setShowQuoteDetails] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [showConvertToInvoiceModal, setShowConvertToInvoiceModal] =
    useState(false);
  const [selectedConvertQuote, setSelectedConvertQuote] = useState(null);

  // Update local state when props change
  useEffect(() => {
    setInvoices(invoicesProp || []);
    setMpesaTransactions(mpesaProp || []);
    setQuotes(quotesProp || []);
  }, [invoicesProp, mpesaProp, quotesProp]);

  // Form states
  const [entryForm, setEntryForm] = useState({
    entry_type: "expense",
    category: "",
    subcategory: "",
    amount: "",
    tax_amount: "0",
    currency: "USD",
    exchange_rate: "1.00",
    transaction_date: new Date().toISOString().split("T")[0],
    transaction_reference: "",
    payment_method: "bank_transfer",
    payment_status: "completed",
    description: "",
    notes: "",
    budget_category: "",
    budget_period: "",
    is_billable: true,
    billable_percentage: "100",
    tax_rate: "0",
    tax_exempt: false,
    tax_region: "",
    project_id: selectedProject?.id || "",
    invoice_id: "",
    receipt_id: "",
    contract_id: "",
  });

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    category_type: "expense",
    default_budget_percentage: "0",
    is_tax_deductible: false,
    requires_approval: false,
    display_order: "0",
    color_code: "#000000",
    icon: "",
    is_active: true,
  });

  const [periodForm, setPeriodForm] = useState({
    project_id: selectedProject?.id || "",
    period_name: "",
    period_type: "monthly",
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date().toISOString().split("T")[0],
    total_budget: "0",
    allocated_budget: "0",
    status: "planning",
    locked: false,
    description: "",
    notes: "",
  });

  const [invoiceForm, setInvoiceForm] = useState({
    project_id: selectedProject?.id || "",
    invoice_type: "project_fee",
    title: "",
    description: "",
    subtotal: "0",
    tax_rate: "0",
    currency: "KES",
    exchange_rate: "1.00",
    issue_date: new Date().toISOString().split("T")[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    payment_method: "mpesa",
    payment_phone: "+254115525854",
    client_name: "",
    client_email: "",
    client_phone: "",
    client_address: "",
    items: [],
    notes: "",
    payment_terms: "Payment due within 30 days",
    terms_conditions: "",
  });

  const [paymentForm, setPaymentForm] = useState({
    invoice_id: "",
    amount: "",
    phone_number: "+254115525854",
    payment_method: "paybill",
    business_number: "174379",
    account_reference: "",
    client_name: "",
    client_email: "",
  });

  const [quoteForm, setQuoteForm] = useState({
    project_id: selectedProject?.id || "",
    quote_type: "project_estimate",
    title: "",
    description: "",
    subtotal: "0",
    tax_rate: "0",
    currency: "KES",
    exchange_rate: "1.00",
    issue_date: new Date().toISOString().split("T")[0],
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    priority: "medium",
    client_name: "",
    client_email: "",
    client_phone: "",
    client_address: "",
    client_company: "",
    items: [],
    notes: "",
    payment_terms: "Payment due within 30 days of acceptance",
    terms_conditions: "",
    delivery_timeline: "Delivery timeline to be determined",
    discount_type: "none",
    discount_value: "0",
    discount_reason: "",
  });

  const financialSections = [
    { id: "entries", label: "Accounting Entries", icon: Receipt },
    { id: "quotes", label: "Quotes/Estimates", icon: FileText },
    { id: "invoices", label: "Invoices", icon: FileText },
    { id: "payments", label: "M-Pesa Payments", icon: CreditCard },
    { id: "categories", label: "Categories", icon: FolderOpen },
    { id: "periods", label: "Financial Periods", icon: Calendar },
    { id: "reports", label: "Financial Reports", icon: FileText },
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
  ];

  const handleAddEntry = () => {
    setEntryForm({
      ...entryForm,
      project_id: selectedProject?.id || "",
      transaction_date: new Date().toISOString().split("T")[0],
    });
    setShowAddEntryForm(true);
  };

  const handleSaveEntry = async () => {
    try {
      const response = await fetch(getApiUrl("/api/accounting/entries"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entryForm),
      });

      if (response.ok) {
        setShowAddEntryForm(false);
        onRefresh();
        // Reset form
        setEntryForm({
          entry_type: "expense",
          category: "",
          subcategory: "",
          amount: "",
          tax_amount: "0",
          currency: "USD",
          exchange_rate: "1.00",
          transaction_date: new Date().toISOString().split("T")[0],
          transaction_reference: "",
          payment_method: "bank_transfer",
          payment_status: "completed",
          description: "",
          notes: "",
          budget_category: "",
          budget_period: "",
          is_billable: true,
          billable_percentage: "100",
          tax_rate: "0",
          tax_exempt: false,
          tax_region: "",
          project_id: selectedProject?.id || "",
          invoice_id: "",
          receipt_id: "",
          contract_id: "",
        });
      }
    } catch (error) {
      console.error("Error saving entry:", error);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    if (window.confirm("Are you sure you want to delete this entry?")) {
      try {
        const response = await fetch(
          getApiUrl(`/api/accounting/entries/${entryId}`),
          {
            method: "DELETE",
          },
        );

        if (response.ok) {
          onRefresh();
        }
      } catch (error) {
        console.error("Error deleting entry:", error);
      }
    }
  };

  // ── Categories / Periods / Reports / Dashboard state ───────────────────────
  const [localCategories, setLocalCategories] = useState(categories || []);
  const [localPeriods, setLocalPeriods] = useState(periods || []);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingPeriod, setEditingPeriod] = useState(null);
  const [financeLoading, setFinanceLoading] = useState(false);
  const [financeError, setFinanceError] = useState(null);
  const [financeSummary, setFinanceSummary] = useState(null);
  const [reportRange, setReportRange] = useState({
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    setLocalCategories(categories || []);
  }, [categories]);

  useEffect(() => {
    setLocalPeriods(periods || []);
  }, [periods]);

  const loadFinanceData = async () => {
    setFinanceLoading(true);
    setFinanceError(null);
    try {
      const [catRes, perRes] = await Promise.all([
        fetch(getApiUrl("/api/accounting/categories")),
        fetch(getApiUrl("/api/accounting/periods")),
      ]);
      const catJson = await catRes.json().catch(() => ({}));
      const perJson = await perRes.json().catch(() => ({}));
      if (catJson.success) setLocalCategories(catJson.categories || []);
      if (perJson.success) setLocalPeriods(perJson.periods || []);

      const params = new URLSearchParams();
      if (selectedProject?.id) params.set("project_id", selectedProject.id);
      if (reportRange.start_date)
        params.set("start_date", reportRange.start_date);
      if (reportRange.end_date) params.set("end_date", reportRange.end_date);

      const sumRes = await fetch(
        getApiUrl(`/api/accounting/reports/summary?${params.toString()}`),
      );
      const sumJson = await sumRes.json().catch(() => ({}));
      if (sumJson.success) setFinanceSummary(sumJson);
    } catch (error) {
      console.error("Error loading finance data:", error);
      setFinanceError(String(error.message || error));
    } finally {
      setFinanceLoading(false);
    }
  };

  useEffect(() => {
    if (
      ["categories", "periods", "reports", "dashboard"].includes(activeSection)
    ) {
      loadFinanceData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection]);

  const handleAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: "",
      description: "",
      category_type: "expense",
      default_budget_percentage: "0",
      is_tax_deductible: false,
      requires_approval: false,
      display_order: "0",
      color_code: "#000000",
      icon: "",
      is_active: true,
    });
    setShowAddCategoryForm(true);
  };

  const handleEditCategory = (cat) => {
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name || "",
      description: cat.description || "",
      category_type: cat.category_type || "expense",
      default_budget_percentage: String(cat.default_budget_percentage ?? "0"),
      is_tax_deductible: Boolean(cat.is_tax_deductible),
      requires_approval: Boolean(cat.requires_approval),
      display_order: String(cat.display_order ?? "0"),
      color_code: cat.color_code || "#000000",
      icon: cat.icon || "",
      is_active: Boolean(cat.is_active),
    });
    setShowAddCategoryForm(true);
  };


  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.transaction_reference
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || entry.entry_type === filterType;
    const matchesCategory =
      filterCategory === "all" || entry.category === filterCategory;
    const matchesStatus =
  const handleSaveCategory = async () => {
    const isEdit = Boolean(editingCategory);
    try {
      const response = await fetch(
        isEdit
          ? getApiUrl(`/api/accounting/categories/${editingCategory.id}`)
          : getApiUrl("/api/accounting/categories"),
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(categoryForm),
        },
      );
      const json = await response.json().catch(() => ({}));
      if (response.ok && json.success) {
        setShowAddCategoryForm(false);
        setEditingCategory(null);
        await loadFinanceData();
        onRefresh();
      } else {
        window.alert(json.message || "Failed to save category");
      }
    } catch (error) {
      console.error("Error saving category:", error);
      window.alert("Failed to save category. Please try again.");
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (
      !window.confirm("Archive this category? It will no longer be selectable.")
    )
      return;
    try {
      const response = await fetch(
        getApiUrl(`/api/accounting/categories/${categoryId}`),
        { method: "DELETE" },
      );
      const json = await response.json().catch(() => ({}));
      if (response.ok && json.success) {
        await loadFinanceData();
        onRefresh();
      } else {
        window.alert(json.message || "Failed to archive category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const handleAddPeriod = () => {
    setEditingPeriod(null);
    setPeriodForm({
      project_id: selectedProject?.id || "",
      period_name: "",
      period_type: "monthly",
      start_date: new Date().toISOString().split("T")[0],
      end_date: new Date().toISOString().split("T")[0],
      total_budget: "0",
      allocated_budget: "0",
      status: "planning",
      locked: false,
      description: "",
      notes: "",
    });
    setShowAddPeriodForm(true);
  };

  const handleEditPeriod = (period) => {
    setEditingPeriod(period);
    setPeriodForm({
      project_id: period.project_id || "",
      period_name: period.period_name || "",
      period_type: period.period_type || "monthly",
      start_date: (period.start_date || "").split("T")[0],
      end_date: (period.end_date || "").split("T")[0],
      total_budget: String(period.total_budget ?? "0"),
      allocated_budget: String(period.allocated_budget ?? "0"),
      status: period.status || "planning",
      locked: Boolean(period.locked),
      description: period.description || "",
      notes: period.notes || "",
    });
    setShowAddPeriodForm(true);
  };

  const handleSavePeriod = async () => {
    const isEdit = Boolean(editingPeriod);
    if (!periodForm.project_id) {
      window.alert(
        "Select a project first — budget periods belong to a project.",
      );
      return;
    }
    try {
      const response = await fetch(
        isEdit
          ? getApiUrl(`/api/accounting/periods/${editingPeriod.id}`)
          : getApiUrl("/api/accounting/periods"),
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(periodForm),
        },
      );
      const json = await response.json().catch(() => ({}));
      if (response.ok && json.success) {
        setShowAddPeriodForm(false);
        setEditingPeriod(null);
        await loadFinanceData();
        onRefresh();
      } else {
        window.alert(json.message || "Failed to save period");
      }
    } catch (error) {
      console.error("Error saving period:", error);
      window.alert("Failed to save period. Please try again.");
    }
  };

  const handleDeletePeriod = async (periodId) => {
    if (
      !window.confirm("Delete this period? Locked periods cannot be deleted.")
    )
      return;
    try {
      const response = await fetch(
        getApiUrl(`/api/accounting/periods/${periodId}`),
        { method: "DELETE" },
      );
      const json = await response.json().catch(() => ({}));
      if (response.ok && json.success) {
        await loadFinanceData();
        onRefresh();
      } else {
        window.alert(json.message || "Failed to delete period");
      }
    } catch (error) {
      console.error("Error deleting period:", error);
    }
  };

  const handleSaveReport = async (reportName) => {
    if (!financeSummary) {
      window.alert("Load the summary first, then save the report.");
      return;
    }
    if (!selectedProject?.id) {
      window.alert(
        "Select a project first — reports are saved against a project.",
      );
      return;
    }
    try {
      const response = await fetch(getApiUrl("/api/financial/reports"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: selectedProject.id,
          report_type: "profit_loss",
          report_name:
            reportName ||
            `P&L — ${selectedProject.name} (${new Date()
              .toISOString()
              .split("T")[0]})`,
          period_start: reportRange.start_date || null,
          period_end: reportRange.end_date || null,
          data: financeSummary,
          summary: `Income ${financeSummary.summary.total_income} | Expenses ${financeSummary.summary.total_expenses} | Net ${financeSummary.summary.net_profit}`,
        }),
      });
      const json = await response.json().catch(() => ({}));
      if (response.ok && json.success) {
        window.alert("Report saved.");
        onRefresh();
      } else {
        window.alert(json.message || "Failed to save report");
      }
    } catch (error) {
      console.error("Error saving report:", error);
      window.alert("Failed to save report. Please try again.");
    }
  };


      filterStatus === "all" || entry.payment_status === filterStatus;

    return matchesSearch && matchesType && matchesCategory && matchesStatus;
  });

  const calculateTotals = () => {
    const income = filteredEntries
      .filter((e) => e.entry_type === "income")
      .reduce((sum, e) => sum + parseFloat(e.total_amount || 0), 0);

    const expenses = filteredEntries
      .filter((e) => e.entry_type === "expense")
      .reduce((sum, e) => sum + parseFloat(e.total_amount || 0), 0);

    return { income, expenses, balance: income - expenses };
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Financial Management
            </h2>
            <p className="text-gray-600 mt-1">
              Manage accounting entries, categories, periods, and reports
            </p>
          </div>
          <div className="flex items-center gap-3">
            {selectedProject && (
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                <FolderOpen className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  {selectedProject.name}
                </span>
                <button
                  onClick={() => setSelectedProject(null)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            )}
            <button
              onClick={onRefresh}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">
                  Total Income
                </p>
                <p className="text-2xl font-bold text-green-900">
                  ${totals.income.toLocaleString()}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">
                  Total Expenses
                </p>
                <p className="text-2xl font-bold text-red-900">
                  ${totals.expenses.toLocaleString()}
                </p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-500" />
            </div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Net Balance</p>
                <p
                  className={`text-2xl font-bold ${totals.balance >= 0 ? "text-blue-900" : "text-red-900"}`}
                >
                  ${Math.abs(totals.balance).toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">
                  Total Entries
                </p>
                <p className="text-2xl font-bold text-purple-900">
                  {filteredEntries.length}
                </p>
              </div>
              <FileText className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200">
          {financialSections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
                activeSection === section.id
                  ? "text-teal-600 border-teal-600"
                  : "text-gray-600 border-transparent hover:text-gray-800"
              }`}
            >
              <section.icon className="w-4 h-4" />
              {section.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Sections */}
      {activeSection === "entries" && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Accounting Entries
            </h3>
            <button
              onClick={handleAddEntry}
              className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Entry
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
              <option value="budget_allocation">Budget Allocation</option>
              <option value="budget_adjustment">Budget Adjustment</option>
              <option value="invoice_payment">Invoice Payment</option>
              <option value="refund">Refund</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          {/* Entries Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.transaction_date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          entry.entry_type === "income"
                            ? "bg-green-100 text-green-800"
                            : entry.entry_type === "expense"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {entry.entry_type.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {entry.category}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>
                        <p className="font-medium">{entry.description}</p>
                        {entry.transaction_reference && (
                          <p className="text-xs text-gray-500">
                            Ref: {entry.transaction_reference}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span
                        className={
                          entry.entry_type === "income"
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      >
                        {entry.entry_type === "income" ? "+" : "-"}$
                        {parseFloat(entry.total_amount || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          entry.payment_status === "completed"
                            ? "bg-green-100 text-green-800"
                            : entry.payment_status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : entry.payment_status === "failed"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {entry.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedEntry(entry);
                            setShowEntryDetails(true);
                          }}
                          className="text-teal-600 hover:text-teal-800"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredEntries.length === 0 && (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No accounting entries found</p>
                <button
                  onClick={handleAddEntry}
                  className="mt-4 text-teal-600 hover:text-teal-800 font-medium"
                >
                  Add your first entry
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Entry Modal */}
      {showAddEntryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-screen overflow-y-auto m-4">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Add Accounting Entry
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Entry Type
                  </label>
                  <select
                    value={entryForm.entry_type}
                    onChange={(e) =>
                      setEntryForm({ ...entryForm, entry_type: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                    <option value="budget_allocation">Budget Allocation</option>
                    <option value="budget_adjustment">Budget Adjustment</option>
                    <option value="invoice_payment">Invoice Payment</option>
                    <option value="refund">Refund</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={entryForm.category}
                    onChange={(e) =>
                      setEntryForm({ ...entryForm, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="e.g., Materials, Labor, Equipment"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={entryForm.amount}
                    onChange={(e) =>
                      setEntryForm({ ...entryForm, amount: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Transaction Date
                  </label>
                  <input
                    type="date"
                    value={entryForm.transaction_date}
                    onChange={(e) =>
                      setEntryForm({
                        ...entryForm,
                        transaction_date: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={entryForm.payment_method}
                    onChange={(e) =>
                      setEntryForm({
                        ...entryForm,
                        payment_method: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="check">Check</option>
                    <option value="online_payment">Online Payment</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Status
                  </label>
                  <select
                    value={entryForm.payment_status}
                    onChange={(e) =>
                      setEntryForm({
                        ...entryForm,
                        payment_status: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                    <option value="partially_refunded">
                      Partially Refunded
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={entryForm.description}
                  onChange={(e) =>
                    setEntryForm({ ...entryForm, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  rows={3}
                  placeholder="Enter description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={entryForm.notes}
                  onChange={(e) =>
                    setEntryForm({ ...entryForm, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  rows={2}
                  placeholder="Additional notes..."
                />
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowAddEntryForm(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEntry}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                Save Entry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Entry Details Modal */}
      {showEntryDetails && selectedEntry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-screen overflow-y-auto m-4">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Entry Details
              </h3>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Entry Type</p>
                  <p className="font-medium capitalize">
                    {selectedEntry.entry_type.replace("_", " ")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Category</p>
                  <p className="font-medium">{selectedEntry.category}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Amount</p>
                  <p
                    className={`font-medium ${selectedEntry.entry_type === "income" ? "text-green-600" : "text-red-600"}`}
                  >
                    {selectedEntry.entry_type === "income" ? "+" : "-"}$
                    {parseFloat(
                      selectedEntry.total_amount || 0,
                    ).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Transaction Date</p>
                  <p className="font-medium">
                    {selectedEntry.transaction_date}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Method</p>
                  <p className="font-medium capitalize">
                    {selectedEntry.payment_method?.replace("_", " ")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Payment Status</p>
                  <p className="font-medium capitalize">
                    {selectedEntry.payment_status}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <p className="text-sm text-gray-600 mb-2">Description</p>
                <p className="font-medium">{selectedEntry.description}</p>
              </div>

              {selectedEntry.notes && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Notes</p>
                  <p className="font-medium">{selectedEntry.notes}</p>
                </div>
              )}

              {selectedEntry.transaction_reference && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Transaction Reference
                  </p>
                  <p className="font-medium">
                    {selectedEntry.transaction_reference}
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t flex justify-end">
              <button
                onClick={() => setShowEntryDetails(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quotes/Estimates Management Section */}
      {activeSection === "quotes" && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Quotes & Estimates
            </h3>
            <button
              onClick={() => {
                setQuoteForm({
                  ...quoteForm,
                  project_id: selectedProject?.id || "",
                  issue_date: new Date().toISOString().split("T")[0],
                  valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split("T")[0],
                });
                setShowAddQuoteForm(true);
              }}
              className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Quote
            </button>
          </div>

          {/* Quote Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">
                    Total Quotes
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {quotes.length}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {
                      quotes.filter(
                        (quote) =>
                          quote.status === "sent" || quote.status === "viewed",
                      ).length
                    }
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Accepted</p>
                  <p className="text-2xl font-bold text-green-900">
                    {
                      quotes.filter((quote) => quote.status === "accepted")
                        .length
                    }
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">
                    Total Value
                  </p>
                  <p className="text-2xl font-bold text-purple-900">
                    KES{" "}
                    {quotes
                      .reduce(
                        (sum, quote) =>
                          sum + parseFloat(quote.total_amount_kes || 0),
                        0,
                      )
                      .toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Quotes Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quote #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issue Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valid Until
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {quotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {quote.quote_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <p className="font-medium">{quote.client_name}</p>
                        {quote.client_company && (
                          <p className="text-xs text-gray-500">
                            {quote.client_company}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      KES{" "}
                      {parseFloat(quote.total_amount_kes || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {quote.issue_date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span
                        className={
                          new Date(quote.valid_until) < new Date()
                            ? "text-red-600 font-medium"
                            : ""
                        }
                      >
                        {quote.valid_until}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          quote.status === "accepted"
                            ? "bg-green-100 text-green-800"
                            : quote.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : quote.status === "sent" ||
                                  quote.status === "viewed"
                                ? "bg-yellow-100 text-yellow-800"
                                : quote.status === "expired"
                                  ? "bg-red-100 text-red-800"
                                  : quote.status === "converted"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {quote.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedQuote(quote);
                            setShowQuoteDetails(true);
                          }}
                          className="text-teal-600 hover:text-teal-800"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {quote.status === "accepted" &&
                          !quote.converted_to_invoice_id && (
                            <button
                              onClick={() => {
                                setSelectedConvertQuote(quote);
                                setShowConvertToInvoiceModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800"
                              title="Convert to Invoice"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                          )}
                        <button
                          className="text-gray-600 hover:text-gray-800"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {quotes.length === 0 && (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No quotes found</p>
                <button
                  onClick={() => setShowAddQuoteForm(true)}
                  className="mt-4 text-teal-600 hover:text-teal-800 font-medium"
                >
                  Create your first quote
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Invoice Management Section */}
      {activeSection === "invoices" && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Invoice Management
            </h3>
            <button
              onClick={() => {
                setInvoiceForm({
                  ...invoiceForm,
                  project_id: selectedProject?.id || "",
                  issue_date: new Date().toISOString().split("T")[0],
                  due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split("T")[0],
                });
                setShowAddInvoiceForm(true);
              }}
              className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Invoice
            </button>
          </div>

          {/* Invoice Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">
                    Total Invoices
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    {invoices.length}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {
                      invoices.filter(
                        (inv) =>
                          inv.status === "sent" || inv.status === "viewed",
                      ).length
                    }
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Paid</p>
                  <p className="text-2xl font-bold text-green-900">
                    {invoices.filter((inv) => inv.status === "paid").length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">
                    Total Amount
                  </p>
                  <p className="text-2xl font-bold text-purple-900">
                    KES{" "}
                    {invoices
                      .reduce(
                        (sum, inv) =>
                          sum + parseFloat(inv.total_amount_kes || 0),
                        0,
                      )
                      .toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Invoices Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issue Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {invoice.invoice_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.client_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      KES{" "}
                      {parseFloat(
                        invoice.total_amount_kes || 0,
                      ).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.issue_date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.due_date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          invoice.status === "paid"
                            ? "bg-green-100 text-green-800"
                            : invoice.status === "overdue"
                              ? "bg-red-100 text-red-800"
                              : invoice.status === "sent" ||
                                  invoice.status === "viewed"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setShowInvoiceDetails(true);
                          }}
                          className="text-teal-600 hover:text-teal-800"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPaymentInvoice(invoice);
                            setPaymentForm({
                              ...paymentForm,
                              invoice_id: invoice.id,
                              amount: invoice.total_amount_kes,
                              account_reference: invoice.invoice_number,
                            });
                            setShowPaymentModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                          title="Process Payment"
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>
                        <button
                          className="text-gray-600 hover:text-gray-800"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {invoices.length === 0 && (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No invoices found</p>
                <button
                  onClick={() => setShowAddInvoiceForm(true)}
                  className="mt-4 text-teal-600 hover:text-teal-800 font-medium"
                >
                  Create your first invoice
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* M-Pesa Payments Section */}
      {activeSection === "payments" && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              M-Pesa Payment Transactions
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Business Number: 174379
              </span>
              <span className="text-sm text-gray-600">
                Phone: +254115525854
              </span>
            </div>
          </div>

          {/* Payment Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">
                    Completed
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    {
                      mpesaTransactions.filter(
                        (tx) => tx.status === "completed",
                      ).length
                    }
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-900">
                    {
                      mpesaTransactions.filter((tx) => tx.status === "pending")
                        .length
                    }
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </div>

            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">Failed</p>
                  <p className="text-2xl font-bold text-red-900">
                    {
                      mpesaTransactions.filter((tx) => tx.status === "failed")
                        .length
                    }
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">
                    Total Processed
                  </p>
                  <p className="text-2xl font-bold text-blue-900">
                    KES{" "}
                    {mpesaTransactions
                      .filter((tx) => tx.status === "completed")
                      .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0)
                      .toLocaleString()}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-500" />
              </div>
            </div>
          </div>

          {/* M-Pesa Transactions Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mpesaTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                      {transaction.transaction_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.phone_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      KES {parseFloat(transaction.amount || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.invoice_id || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(
                        transaction.transaction_date,
                      ).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          transaction.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : transaction.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : transaction.status === "failed"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          className="text-teal-600 hover:text-teal-800"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {!transaction.reconciled && (
                          <button
                            className="text-blue-600 hover:text-blue-800"
                            title="Reconcile"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {mpesaTransactions.length === 0 && (
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No M-Pesa transactions found</p>
                <p className="text-sm text-gray-500 mt-2">
                  Payments will appear here when processed
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Invoice Modal */}
      {showAddInvoiceForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-screen overflow-y-auto m-4">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Create Invoice
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Invoice Type
                  </label>
                  <select
                    value={invoiceForm.invoice_type}
                    onChange={(e) =>
                      setInvoiceForm({
                        ...invoiceForm,
                        invoice_type: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="project_fee">Project Fee</option>
                    <option value="milestone">Milestone</option>
                    <option value="expense">Expense</option>
                    <option value="retainer">Retainer</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Invoice Title
                  </label>
                  <input
                    type="text"
                    value={invoiceForm.title}
                    onChange={(e) =>
                      setInvoiceForm({ ...invoiceForm, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="e.g., Website Development Invoice"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subtotal (KES)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={invoiceForm.subtotal}
                    onChange={(e) =>
                      setInvoiceForm({
                        ...invoiceForm,
                        subtotal: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={invoiceForm.tax_rate}
                    onChange={(e) =>
                      setInvoiceForm({
                        ...invoiceForm,
                        tax_rate: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={invoiceForm.issue_date}
                    onChange={(e) =>
                      setInvoiceForm({
                        ...invoiceForm,
                        issue_date: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={invoiceForm.due_date}
                    onChange={(e) =>
                      setInvoiceForm({
                        ...invoiceForm,
                        due_date: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={invoiceForm.payment_method}
                    onChange={(e) =>
                      setInvoiceForm({
                        ...invoiceForm,
                        payment_method: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="mpesa">M-Pesa</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="check">Check</option>
                    <option value="online_payment">Online Payment</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Phone
                  </label>
                  <input
                    type="tel"
                    value={invoiceForm.payment_phone}
                    onChange={(e) =>
                      setInvoiceForm({
                        ...invoiceForm,
                        payment_phone: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="+254115525854"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={invoiceForm.client_name}
                    onChange={(e) =>
                      setInvoiceForm({
                        ...invoiceForm,
                        client_name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Client name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Email
                  </label>
                  <input
                    type="email"
                    value={invoiceForm.client_email}
                    onChange={(e) =>
                      setInvoiceForm({
                        ...invoiceForm,
                        client_email: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="client@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Phone
                  </label>
                  <input
                    type="tel"
                    value={invoiceForm.client_phone}
                    onChange={(e) =>
                      setInvoiceForm({
                        ...invoiceForm,
                        client_phone: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <select
                    value={invoiceForm.currency}
                    onChange={(e) =>
                      setInvoiceForm({
                        ...invoiceForm,
                        currency: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="KES">Kenyan Shillings (KES)</option>
                    <option value="USD">US Dollars (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                    <option value="GBP">British Pound (GBP)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Address
                </label>
                <textarea
                  value={invoiceForm.client_address}
                  onChange={(e) =>
                    setInvoiceForm({
                      ...invoiceForm,
                      client_address: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  rows={2}
                  placeholder="Client address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={invoiceForm.description}
                  onChange={(e) =>
                    setInvoiceForm({
                      ...invoiceForm,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  rows={3}
                  placeholder="Invoice description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Terms
                </label>
                <textarea
                  value={invoiceForm.payment_terms}
                  onChange={(e) =>
                    setInvoiceForm({
                      ...invoiceForm,
                      payment_terms: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  rows={2}
                  placeholder="Payment terms..."
                />
              </div>

              {/* Invoice Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Invoice Summary
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">
                      KES{" "}
                      {parseFloat(invoiceForm.subtotal || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Tax ({invoiceForm.tax_rate}%):
                    </span>
                    <span className="font-medium">
                      KES{" "}
                      {(
                        (parseFloat(invoiceForm.subtotal || 0) *
                          parseFloat(invoiceForm.tax_rate || 0)) /
                        100
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 border-t pt-2">
                    <span>Total:</span>
                    <span>
                      KES{" "}
                      {(
                        parseFloat(invoiceForm.subtotal || 0) *
                        (1 + parseFloat(invoiceForm.tax_rate || 0) / 100)
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowAddInvoiceForm(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Generate invoice number and save
                  const invoiceNumber = `INV-${Date.now()}`;
                  const newInvoice = {
                    ...invoiceForm,
                    invoice_number: invoiceNumber,
                    total_amount:
                      parseFloat(invoiceForm.subtotal || 0) *
                      (1 + parseFloat(invoiceForm.tax_rate || 0) / 100),
                    total_amount_kes:
                      parseFloat(invoiceForm.subtotal || 0) *
                      (1 + parseFloat(invoiceForm.tax_rate || 0) / 100) *
                      parseFloat(invoiceForm.exchange_rate || 1),
                  };
                  setInvoices([...invoices, { ...newInvoice, id: Date.now() }]);
                  setShowAddInvoiceForm(false);
                  setInvoiceForm({
                    project_id: selectedProject?.id || "",
                    invoice_type: "project_fee",
                    title: "",
                    description: "",
                    subtotal: "0",
                    tax_rate: "0",
                    currency: "KES",
                    exchange_rate: "1.00",
                    issue_date: new Date().toISOString().split("T")[0],
                    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                      .toISOString()
                      .split("T")[0],
                    payment_method: "mpesa",
                    payment_phone: "+254799789956",
                    client_name: "",
                    client_email: "",
                    client_phone: "",
                    client_address: "",
                    items: [],
                    notes: "",
                    payment_terms: "Payment due within 30 days",
                    terms_conditions: "",
                  });
                }}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                Create Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* M-Pesa Payment Modal */}
      {showPaymentModal && selectedPaymentInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md max-h-screen overflow-y-auto m-4">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Process M-Pesa Payment
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Invoice: {selectedPaymentInvoice.invoice_number}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">
                      Amount Due
                    </p>
                    <p className="text-2xl font-bold text-green-900">
                      KES {parseFloat(paymentForm.amount || 0).toLocaleString()}
                    </p>
                  </div>
                  <CreditCard className="w-8 h-8 text-green-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={paymentForm.phone_number}
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      phone_number: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="+254115525854"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Number
                </label>
                <input
                  type="text"
                  value={paymentForm.business_number}
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      business_number: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="174379"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Reference
                </label>
                <input
                  type="text"
                  value={paymentForm.account_reference}
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      account_reference: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Invoice number"
                />
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">
                  M-Pesa Payment Instructions
                </h4>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Go to M-Pesa on your phone</li>
                  <li>2. Select Lipa na M-Pesa</li>
                  <li>3. Select Pay Bill</li>
                  <li>4. Enter Business Number: 174379</li>
                  <li>
                    5. Enter Account Number: {paymentForm.account_reference}
                  </li>
                  <li>
                    6. Enter Amount: KES{" "}
                    {parseFloat(paymentForm.amount || 0).toLocaleString()}
                  </li>
                  <li>7. Enter your M-Pesa PIN and confirm</li>
                </ol>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Simulate payment processing
                  const transactionId = `MPESA${Date.now()}`;
                  const newTransaction = {
                    id: Date.now(),
                    invoice_id: selectedPaymentInvoice.id,
                    transaction_id: transactionId,
                    amount: paymentForm.amount,
                    phone_number: paymentForm.phone_number,
                    status: "pending",
                    transaction_date: new Date().toISOString(),
                    business_number: paymentForm.business_number,
                    account_reference: paymentForm.account_reference,
                  };
                  setMpesaTransactions([...mpesaTransactions, newTransaction]);

                  // Update invoice status
                  setInvoices(
                    invoices.map((inv) =>
                      inv.id === selectedPaymentInvoice.id
                        ? { ...inv, status: "sent", payment_status: "pending" }
                        : inv,
                    ),
                  );

                  setShowPaymentModal(false);
                  setSelectedPaymentInvoice(null);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Process Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Quote Modal */}
      {showAddQuoteForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-screen overflow-y-auto m-4">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Create Quote/Estimate
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quote Type
                  </label>
                  <select
                    value={quoteForm.quote_type}
                    onChange={(e) =>
                      setQuoteForm({ ...quoteForm, quote_type: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="project_estimate">Project Estimate</option>
                    <option value="service_quote">Service Quote</option>
                    <option value="product_quote">Product Quote</option>
                    <option value="consultation">Consultation</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={quoteForm.priority}
                    onChange={(e) =>
                      setQuoteForm({ ...quoteForm, priority: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quote Title
                  </label>
                  <input
                    type="text"
                    value={quoteForm.title}
                    onChange={(e) =>
                      setQuoteForm({ ...quoteForm, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="e.g., Website Development Quote"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subtotal (KES)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={quoteForm.subtotal}
                    onChange={(e) =>
                      setQuoteForm({ ...quoteForm, subtotal: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={quoteForm.tax_rate}
                    onChange={(e) =>
                      setQuoteForm({ ...quoteForm, tax_rate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Issue Date
                  </label>
                  <input
                    type="date"
                    value={quoteForm.issue_date}
                    onChange={(e) =>
                      setQuoteForm({ ...quoteForm, issue_date: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valid Until
                  </label>
                  <input
                    type="date"
                    value={quoteForm.valid_until}
                    onChange={(e) =>
                      setQuoteForm({
                        ...quoteForm,
                        valid_until: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Currency
                  </label>
                  <select
                    value={quoteForm.currency}
                    onChange={(e) =>
                      setQuoteForm({ ...quoteForm, currency: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="KES">Kenyan Shillings (KES)</option>
                    <option value="USD">US Dollars (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                    <option value="GBP">British Pound (GBP)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Type
                  </label>
                  <select
                    value={quoteForm.discount_type}
                    onChange={(e) =>
                      setQuoteForm({
                        ...quoteForm,
                        discount_type: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="none">No Discount</option>
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>

                {quoteForm.discount_type !== "none" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount{" "}
                      {quoteForm.discount_type === "percentage"
                        ? "(%)"
                        : "(KES)"}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={quoteForm.discount_value}
                      onChange={(e) =>
                        setQuoteForm({
                          ...quoteForm,
                          discount_value: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="0.00"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={quoteForm.client_name}
                    onChange={(e) =>
                      setQuoteForm({
                        ...quoteForm,
                        client_name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Client name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Company
                  </label>
                  <input
                    type="text"
                    value={quoteForm.client_company}
                    onChange={(e) =>
                      setQuoteForm({
                        ...quoteForm,
                        client_company: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Email
                  </label>
                  <input
                    type="email"
                    value={quoteForm.client_email}
                    onChange={(e) =>
                      setQuoteForm({
                        ...quoteForm,
                        client_email: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="client@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Phone
                  </label>
                  <input
                    type="tel"
                    value={quoteForm.client_phone}
                    onChange={(e) =>
                      setQuoteForm({
                        ...quoteForm,
                        client_phone: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Phone number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Address
                </label>
                <textarea
                  value={quoteForm.client_address}
                  onChange={(e) =>
                    setQuoteForm({
                      ...quoteForm,
                      client_address: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  rows={2}
                  placeholder="Client address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={quoteForm.description}
                  onChange={(e) =>
                    setQuoteForm({ ...quoteForm, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  rows={3}
                  placeholder="Quote description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Timeline
                </label>
                <textarea
                  value={quoteForm.delivery_timeline}
                  onChange={(e) =>
                    setQuoteForm({
                      ...quoteForm,
                      delivery_timeline: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  rows={2}
                  placeholder="Expected delivery timeline..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Terms
                </label>
                <textarea
                  value={quoteForm.payment_terms}
                  onChange={(e) =>
                    setQuoteForm({
                      ...quoteForm,
                      payment_terms: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  rows={2}
                  placeholder="Payment terms..."
                />
              </div>

              {quoteForm.discount_type !== "none" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Reason
                  </label>
                  <textarea
                    value={quoteForm.discount_reason}
                    onChange={(e) =>
                      setQuoteForm({
                        ...quoteForm,
                        discount_reason: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    rows={2}
                    placeholder="Reason for discount..."
                  />
                </div>
              )}

              {/* Quote Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Quote Summary
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">
                      KES {parseFloat(quoteForm.subtotal || 0).toLocaleString()}
                    </span>
                  </div>
                  {quoteForm.discount_type === "percentage" &&
                    parseFloat(quoteForm.discount_value || 0) > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Discount ({quoteForm.discount_value}%):
                        </span>
                        <span className="font-medium">
                          -KES{" "}
                          {(
                            (parseFloat(quoteForm.subtotal || 0) *
                              parseFloat(quoteForm.discount_value || 0)) /
                            100
                          ).toLocaleString()}
                        </span>
                      </div>
                    )}
                  {quoteForm.discount_type === "fixed" &&
                    parseFloat(quoteForm.discount_value || 0) > 0 && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Discount:</span>
                        <span className="font-medium">
                          -KES{" "}
                          {parseFloat(
                            quoteForm.discount_value || 0,
                          ).toLocaleString()}
                        </span>
                      </div>
                    )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Tax ({quoteForm.tax_rate}%):
                    </span>
                    <span className="font-medium">
                      KES{" "}
                      {(
                        (parseFloat(quoteForm.subtotal || 0) *
                          parseFloat(quoteForm.tax_rate || 0)) /
                        100
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 border-t pt-2">
                    <span>Total:</span>
                    <span>
                      KES{" "}
                      {(
                        parseFloat(quoteForm.subtotal || 0) *
                          (1 + parseFloat(quoteForm.tax_rate || 0) / 100) -
                        (quoteForm.discount_type === "percentage"
                          ? (parseFloat(quoteForm.subtotal || 0) *
                              parseFloat(quoteForm.discount_value || 0)) /
                            100
                          : parseFloat(quoteForm.discount_value || 0))
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowAddQuoteForm(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Generate quote number and save
                  const quoteNumber = `QUOTE-${Date.now()}`;
                  const discountedSubtotal =
                    quoteForm.discount_type === "percentage"
                      ? parseFloat(quoteForm.subtotal || 0) *
                        (1 - parseFloat(quoteForm.discount_value || 0) / 100)
                      : parseFloat(quoteForm.subtotal || 0) -
                        parseFloat(quoteForm.discount_value || 0);
                  const totalAmount =
                    discountedSubtotal *
                    (1 + parseFloat(quoteForm.tax_rate || 0) / 100);

                  const newQuote = {
                    ...quoteForm,
                    quote_number: quoteNumber,
                    total_amount: totalAmount,
                    total_amount_kes:
                      totalAmount * parseFloat(quoteForm.exchange_rate || 1),
                  };
                  setQuotes([...quotes, { ...newQuote, id: Date.now() }]);
                  setShowAddQuoteForm(false);
                  setQuoteForm({
                    project_id: selectedProject?.id || "",
                    quote_type: "project_estimate",
                    title: "",
                    description: "",
                    subtotal: "0",
                    tax_rate: "0",
                    currency: "KES",
                    exchange_rate: "1.00",
                    issue_date: new Date().toISOString().split("T")[0],
                    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                      .toISOString()
                      .split("T")[0],
                    priority: "medium",
                    client_name: "",
                    client_email: "",
                    client_phone: "",
                    client_address: "",
                    client_company: "",
                    items: [],
                    notes: "",
                    payment_terms: "Payment due within 30 days of acceptance",
                    terms_conditions: "",
                    delivery_timeline: "Delivery timeline to be determined",
                    discount_type: "none",
                    discount_value: "0",
                    discount_reason: "",
                  });
                }}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                Create Quote
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Convert Quote to Invoice Modal */}
      {showConvertToInvoiceModal && selectedConvertQuote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md max-h-screen overflow-y-auto m-4">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Convert Quote to Invoice
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Quote: {selectedConvertQuote.quote_number}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-600">
                      Quote Amount
                    </p>
                    <p className="text-2xl font-bold text-green-900">
                      KES{" "}
                      {parseFloat(
                        selectedConvertQuote.total_amount_kes || 0,
                      ).toLocaleString()}
                    </p>
                  </div>
                  <FileText className="w-8 h-8 text-green-500" />
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Invoice Title
                  </label>
                  <input
                    type="text"
                    defaultValue={`Invoice for ${selectedConvertQuote.title}`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    defaultValue={
                      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                        .toISOString()
                        .split("T")[0]
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">
                  Conversion Details
                </h4>
                <div className="space-y-1 text-sm text-blue-800">
                  <p>
                    <strong>Client:</strong> {selectedConvertQuote.client_name}
                  </p>
                  <p>
                    <strong>Quote Number:</strong>{" "}
                    {selectedConvertQuote.quote_number}
                  </p>
                  <p>
                    <strong>Quote Amount:</strong> KES{" "}
                    {parseFloat(
                      selectedConvertQuote.total_amount_kes || 0,
                    ).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-3">
              <button
                onClick={() => setShowConvertToInvoiceModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Create invoice from quote
                  const invoiceNumber = `INV-${Date.now()}`;
                  const newInvoice = {
                    invoice_number: invoiceNumber,
                    title: `Invoice for ${selectedConvertQuote.title}`,
                    description: selectedConvertQuote.description,
                    subtotal: selectedConvertQuote.subtotal,
                    tax_rate: selectedConvertQuote.tax_rate,
                    currency: selectedConvertQuote.currency,
                    exchange_rate: selectedConvertQuote.exchange_rate,
                    issue_date: new Date().toISOString().split("T")[0],
                    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                      .toISOString()
                      .split("T")[0],
                    payment_method: "mpesa",
                    payment_phone: "+254115525854",
                    client_name: selectedConvertQuote.client_name,
                    client_email: selectedConvertQuote.client_email,
                    client_phone: selectedConvertQuote.client_phone,
                    client_address: selectedConvertQuote.client_address,
                    notes: `Converted from quote ${selectedConvertQuote.quote_number}`,
                    payment_terms: selectedConvertQuote.payment_terms,
                    terms_conditions: selectedConvertQuote.terms_conditions,
                    total_amount: selectedConvertQuote.total_amount,
                    total_amount_kes: selectedConvertQuote.total_amount_kes,
                    status: "sent",
                    payment_status: "pending",
                  };

                  setInvoices([...invoices, { ...newInvoice, id: Date.now() }]);

                  // Update quote status
                  setQuotes(
                    quotes.map((quote) =>
                      quote.id === selectedConvertQuote.id
                        ? {
                            ...quote,
                            status: "converted",
                            converted_to_invoice_id: Date.now(),
                          }
                        : quote,
                    ),
                  );

                  setShowConvertToInvoiceModal(false);
                  setSelectedConvertQuote(null);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Convert to Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Other sections can be added here - categories, periods, reports, dashboard */}
      {activeSection === "categories" && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Accounting Categories
            </h3>
            <button
              onClick={handleAddCategory}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          </div>

          {financeError && (
            <div className="mb-4 px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm">
              {financeError}
            </div>
          )}

          {financeLoading ? (
            <div className="text-center py-8 text-gray-500">
              Loading categories…
            </div>
          ) : localCategories.length === 0 ? (
            <div className="text-center py-8">
              <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                No categories yet — add your first one.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Type</th>
                    <th className="py-2 pr-4">Budget %</th>
                    <th className="py-2 pr-4">Tax</th>
                    <th className="py-2 pr-4">Approval</th>
                    <th className="py-2 pr-4">Order</th>
                    <th className="py-2 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {localCategories.map((cat) => (
                    <tr key={cat.id} className="border-b last:border-0">
                      <td className="py-2 pr-4 font-medium text-gray-900">
                        <span
                          className="inline-block w-3 h-3 rounded-full mr-2"
                          style={{
                            backgroundColor: cat.color_code || "#000000",
                          }}
                        />
                        {cat.name}
                      </td>
                      <td className="py-2 pr-4 capitalize">
                        {cat.category_type}
                      </td>
                      <td className="py-2 pr-4">
                        {cat.default_budget_percentage}%
                      </td>
                      <td className="py-2 pr-4">
                        {cat.is_tax_deductible ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-300" />
                        )}
                      </td>
                      <td className="py-2 pr-4">
                        {cat.requires_approval ? (
                          <CheckCircle className="w-4 h-4 text-amber-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-gray-300" />
                        )}
                      </td>
                      <td className="py-2 pr-4">{cat.display_order}</td>
                      <td className="py-2 pr-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditCategory(cat)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                            title="Archive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {showAddCategoryForm && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {editingCategory ? "Edit Category" : "Add Category"}
                  </h4>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={categoryForm.name}
                      onChange={(e) =>
                        setCategoryForm({
                          ...categoryForm,
                          name: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type
                      </label>
                      <select
                        value={categoryForm.category_type}
                        onChange={(e) =>
                          setCategoryForm({
                            ...categoryForm,
                            category_type: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                        <option value="both">Both</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Default Budget %
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={categoryForm.default_budget_percentage}
                        onChange={(e) =>
                          setCategoryForm({
                            ...categoryForm,
                            default_budget_percentage: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      value={categoryForm.description}
                      onChange={(e) =>
                        setCategoryForm({
                          ...categoryForm,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Display Order
                      </label>
                      <input
                        type="number"
                        value={categoryForm.display_order}
                        onChange={(e) =>
                          setCategoryForm({
                            ...categoryForm,
                            display_order: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Color
                      </label>
                      <input
                        type="color"
                        value={categoryForm.color_code}
                        onChange={(e) =>
                          setCategoryForm({
                            ...categoryForm,
                            color_code: e.target.value,
                          })
                        }
                        className="w-full h-10 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Icon
                      </label>
                      <input
                        type="text"
                        value={categoryForm.icon}
                        onChange={(e) =>
                          setCategoryForm({
                            ...categoryForm,
                            icon: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={categoryForm.is_tax_deductible}
                        onChange={(e) =>
                          setCategoryForm({
                            ...categoryForm,
                            is_tax_deductible: e.target.checked,
                          })
                        }
                      />
                      Tax deductible
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={categoryForm.requires_approval}
                        onChange={(e) =>
                          setCategoryForm({
                            ...categoryForm,
                            requires_approval: e.target.checked,
                          })
                        }
                      />
                      Requires approval
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={categoryForm.is_active}
                        onChange={(e) =>
                          setCategoryForm({
                            ...categoryForm,
                            is_active: e.target.checked,
                          })
                        }
                      />
                      Active
                    </label>
                  </div>
                </div>
                <div className="p-6 border-t flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowAddCategoryForm(false);
                      setEditingCategory(null);
                    }}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveCategory}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    {editingCategory ? "Update Category" : "Create Category"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeSection === "periods" && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Financial Periods
            </h3>
            <button
              onClick={handleAddPeriod}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Period
            </button>
          </div>

          {financeError && (
            <div className="mb-4 px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm">
              {financeError}
            </div>
          )}

          {financeLoading ? (
            <div className="text-center py-8 text-gray-500">
              Loading periods…
            </div>
          ) : localPeriods.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                No financial periods yet — create one to start budgeting.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="py-2 pr-4">Period</th>
                    <th className="py-2 pr-4">Type</th>
                    <th className="py-2 pr-4">Start</th>
                    <th className="py-2 pr-4">End</th>
                    <th className="py-2 pr-4">Total Budget</th>
                    <th className="py-2 pr-4">Allocated</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {localPeriods.map((period) => (
                    <tr key={period.id} className="border-b last:border-0">
                      <td className="py-2 pr-4 font-medium text-gray-900">
                        {period.period_name}
                        {period.project_name && (
                          <span className="block text-xs text-gray-500">
                            {period.project_name}
                          </span>
                        )}
                      </td>
                      <td className="py-2 pr-4 capitalize">
                        {period.period_type}
                      </td>
                      <td className="py-2 pr-4">
                        {(period.start_date || "").split("T")[0]}
                      </td>
                      <td className="py-2 pr-4">
                        {(period.end_date || "").split("T")[0]}
                      </td>
                      <td className="py-2 pr-4">
                        {parseFloat(period.total_budget || 0).toLocaleString()}
                      </td>
                      <td className="py-2 pr-4">
                        {parseFloat(
                          period.allocated_budget || 0,
                        ).toLocaleString()}
                      </td>
                      <td className="py-2 pr-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                            period.status === "active"
                              ? "bg-green-100 text-green-700"
                              : period.status === "closed"
                                ? "bg-gray-100 text-gray-600"
                                : period.status === "archived"
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {period.locked && <Lock className="w-3 h-3" />}
                          {period.status || "planning"}
                        </span>
                      </td>
                      <td className="py-2 pr-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditPeriod(period)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePeriod(period.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                            disabled={period.locked}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {showAddPeriodForm && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {editingPeriod ? "Edit Period" : "Add Period"}
                  </h4>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Period Name *
                    </label>
                    <input
                      type="text"
                      value={periodForm.period_name}
                      onChange={(e) =>
                        setPeriodForm({
                          ...periodForm,
                          period_name: e.target.value,
                        })
                      }
                      placeholder="e.g. Q1 2026"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  {(projects || []).length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Project *
                      </label>
                      <select
                        value={periodForm.project_id}
                        onChange={(e) =>
                          setPeriodForm({
                            ...periodForm,
                            project_id: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="">— Select a project —</option>
                        {(projects || []).map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name || p.project_name || `Project #${p.id}`}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Period Type
                      </label>
                      <select
                        value={periodForm.period_type}
                        onChange={(e) =>
                          setPeriodForm({
                            ...periodForm,
                            period_type: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="yearly">Yearly</option>
                        <option value="custom">Custom</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={periodForm.status}
                        onChange={(e) =>
                          setPeriodForm({
                            ...periodForm,
                            status: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="planning">Planning</option>
                        <option value="active">Active</option>
                        <option value="closed">Closed</option>
                        <option value="archived">Archived</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        value={periodForm.start_date}
                        onChange={(e) =>
                          setPeriodForm({
                            ...periodForm,
                            start_date: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End Date *
                      </label>
                      <input
                        type="date"
                        value={periodForm.end_date}
                        onChange={(e) =>
                          setPeriodForm({
                            ...periodForm,
                            end_date: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Total Budget
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={periodForm.total_budget}
                        onChange={(e) =>
                          setPeriodForm({
                            ...periodForm,
                            total_budget: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Allocated Budget
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={periodForm.allocated_budget}
                        onChange={(e) =>
                          setPeriodForm({
                            ...periodForm,
                            allocated_budget: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      rows={2}
                      value={periodForm.description}
                      onChange={(e) =>
                        setPeriodForm({
                          ...periodForm,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      rows={2}
                      value={periodForm.notes}
                      onChange={(e) =>
                        setPeriodForm({ ...periodForm, notes: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={periodForm.locked}
                      onChange={(e) =>
                        setPeriodForm({
                          ...periodForm,
                          locked: e.target.checked,
                        })
                      }
                    />
                    Locked (prevents edits and deletion)
                  </label>
                </div>
                <div className="p-6 border-t flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowAddPeriodForm(false);
                      setEditingPeriod(null);
                    }}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSavePeriod}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                  >
                    {editingPeriod ? "Update Period" : "Create Period"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeSection === "reports" && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Financial Reports
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="date"
                value={reportRange.start_date}
                onChange={(e) =>
                  setReportRange({ ...reportRange, start_date: e.target.value })
                }
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <span className="text-gray-400 text-sm">to</span>
              <input
                type="date"
                value={reportRange.end_date}
                onChange={(e) =>
                  setReportRange({ ...reportRange, end_date: e.target.value })
                }
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                onClick={loadFinanceData}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Apply
              </button>
              <button
                onClick={() => handleSaveReport()}
                className="px-4 py-2 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
              >
                Save Report
              </button>
            </div>
          </div>

          {financeError && (
            <div className="mb-4 px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm">
              {financeError}
            </div>
          )}

          {!financeSummary && financeLoading ? (
            <div className="text-center py-8 text-gray-500">
              Building report…
            </div>
          ) : financeSummary ? (
            <div className="space-y-6">
              {/* Profit & Loss Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-green-600">
                    Total Income
                  </p>
                  <p className="text-2xl font-bold text-green-900">
                    ${financeSummary.summary.total_income.toLocaleString()}
                  </p>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-red-600">
                    Total Expenses
                  </p>
                  <p className="text-2xl font-bold text-red-900">
                    ${financeSummary.summary.total_expenses.toLocaleString()}
                  </p>
                </div>
                <div
                  className={`rounded-lg p-4 ${
                    financeSummary.summary.net_profit >= 0
                      ? "bg-blue-50"
                      : "bg-orange-50"
                  }`}
                >
                  <p
                    className={`text-sm font-medium ${
                      financeSummary.summary.net_profit >= 0
                        ? "text-blue-600"
                        : "text-orange-600"
                    }`}
                  >
                    Net Profit
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      financeSummary.summary.net_profit >= 0
                        ? "text-blue-900"
                        : "text-orange-900"
                    }`}
                  >
                    ${Math.abs(financeSummary.summary.net_profit).toLocaleString()}
                    {financeSummary.summary.net_profit < 0 && " loss"}
                  </p>
                </div>
              </div>

              <p className="text-xs text-gray-500">
                Based on {financeSummary.summary.entry_count} entries
                {financeSummary.summary.total_tax
                  ? ` • Tax recorded: $${financeSummary.summary.total_tax.toLocaleString()}`
                  : ""}
              </p>
              {/* Breakdown by Category */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Breakdown by Category
                </h4>
                {financeSummary.by_category.length === 0 ? (
                  <p className="text-sm text-gray-500 py-4 text-center">
                    No entries in this range.
                  </p>
                ) : (
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b">
                        <th className="py-2 pr-4">Type</th>
                        <th className="py-2 pr-4">Category</th>
                        <th className="py-2 pr-4">Entries</th>
                        <th className="py-2 pr-4 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {financeSummary.by_category.map((row, idx) => (
                        <tr key={idx} className="border-b last:border-0">
                          <td className="py-2 pr-4">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-xs capitalize ${
                                row.entry_type === "income"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {row.entry_type}
                            </span>
                          </td>
                          <td className="py-2 pr-4">{row.category || "—"}</td>
                          <td className="py-2 pr-4">{row.entry_count}</td>
                          <td className="py-2 pr-4 text-right font-medium">
                            ${row.total.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              {/* Monthly Trend */}
              {financeSummary.by_month.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Monthly Trend
                  </h4>
                  <div className="space-y-2">
                    {financeSummary.by_month.map((row) => {
                      const maxVal = Math.max(
                        ...financeSummary.by_month.map((m) =>
                          Math.max(m.income, m.expenses),
                        ),
                        1,
                      );
                      return (
                        <div key={row.month} className="flex items-center gap-3">
                          <span className="text-xs text-gray-500 w-16">
                            {row.month}
                          </span>
                          <div className="flex-1">
                            <div
                              className="h-3 bg-green-400 rounded"
                              style={{ width: `${(row.income / maxVal) * 100}%` }}
                              title={`Income $${row.income.toLocaleString()}`}
                            />
                            <div
                              className="h-3 bg-red-400 rounded mt-1"
                              style={{
                                width: `${(row.expenses / maxVal) * 100}%`,
                              }}
                              title={`Expenses $${row.expenses.toLocaleString()}`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-2 bg-green-400 rounded" /> Income
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-2 bg-red-400 rounded" /> Expenses
                    </span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                Set a date range and click Apply to generate a report.
              </p>
            </div>
          )}
        </div>
      )}

      {activeSection === "dashboard" && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Financial Dashboard
            </h3>
            {selectedProject && (
              <span className="text-xs font-medium text-blue-900 bg-blue-50 px-3 py-1 rounded-full">
                {selectedProject.name}
              </span>
            )}
          </div>

          {financeError && (
            <div className="mb-4 px-4 py-2 bg-red-50 text-red-700 rounded-lg text-sm">
              {financeError}
            </div>
          )}

          {financeLoading && !financeSummary ? (
            <div className="text-center py-8 text-gray-500">
              Loading dashboard…
            </div>
          ) : financeSummary ? (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">
                        Income
                      </p>
                      <p className="text-xl font-bold text-green-900">
                        ${financeSummary.summary.total_income.toLocaleString()}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-600">
                        Expenses
                      </p>
                      <p className="text-xl font-bold text-red-900">
                        ${financeSummary.summary.total_expenses.toLocaleString()}
                      </p>
                    </div>
                    <TrendingDown className="w-8 h-8 text-red-500" />
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">
                        Net Balance
                      </p>
                      <p className="text-xl font-bold text-blue-900">
                        ${financeSummary.summary.net_profit.toLocaleString()}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-blue-500" />
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-600">
                        Entries
                      </p>
                      <p className="text-xl font-bold text-purple-900">
                        {financeSummary.summary.entry_count}
                      </p>
                    </div>
                    <Receipt className="w-8 h-8 text-purple-500" />
                  </div>
                </div>
              </div>
              {/* Payment status breakdown */}
              {financeSummary.by_status.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Payment Status
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {financeSummary.by_status.map((row, idx) => (
                      <div
                        key={idx}
                        className="border border-gray-200 rounded-lg p-3"
                      >
                        <p className="text-xs text-gray-500 capitalize">
                          {row.payment_status || "unknown"}
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          ${row.total.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400">
                          {row.entry_count} entries
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* Top categories */}
              {financeSummary.by_category.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Top Categories
                  </h4>
                  <div className="space-y-2">
                    {financeSummary.by_category.slice(0, 5).map((row, idx) => {
                      const maxTotal = Math.max(
                        ...financeSummary.by_category.map((c) => c.total),
                        1,
                      );
                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-3 text-sm"
                        >
                          <span className="w-32 truncate text-gray-600">
                            {row.category || "—"}
                          </span>
                          <div className="flex-1 bg-gray-100 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                row.entry_type === "income"
                                  ? "bg-green-400"
                                  : "bg-red-400"
                              }`}
                              style={{
                                width: `${(row.total / maxTotal) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="w-24 text-right font-medium text-gray-900">
                            ${row.total.toLocaleString()}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <button
                onClick={() => setActiveSection("reports")}
                className="text-sm text-teal-600 hover:text-teal-700 font-medium"
              >
                View detailed P&L report →
              </button>
            </div>
          ) : (
            <div className="text-center py-8">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No financial data to display yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FinancialManagement;
