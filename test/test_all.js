// Break-even salary runner per state
document.addEventListener('DOMContentLoaded', function() {
  const testButton = document.getElementById('test-button');
  const exportButton = document.getElementById('export-tests-button');
  const resultsContainer = document.getElementById('test-results');

  if (!testButton || !resultsContainer) return;

  testButton.addEventListener('click', function() {
    if (!window.Calculator) {
      resultsContainer.textContent = 'Calculator API not available. Ensure calculator.js loaded first.';
      return;
    }
    runBreakEvenPerState();
  });

  if (exportButton) {
    exportButton.addEventListener('click', function() {
      const table = resultsContainer.querySelector('table');
      if (!table) {
        alert('No test results to export. Run tests first.');
        return;
      }
      const csv = tableToCsv(table);
      downloadCsv(csv, 'state_break_even.csv');
    });
  }

  function runBreakEvenPerState() {
    const { stateTaxRates, stateSalaryRates, stateTotalCompRates, computeCostsForInput } = window.Calculator;
    const states = Object.keys(stateTaxRates || {});

    // Defaults from calculator.js and results.php composition
    const DEFAULTS = {
      commission: 36000,            // AvgYearlyCommissionsPerSDR
      benefitsRatePct: 20,          // BenefitsRate
      managerCostPerYear: 137000,   // SDRManagementCostPerYear
      sdrsSeekingToHire: 7,         // SDRsSeekingToHire
      basePayrollPct: 7.65,         // Base US payroll
      monthlyLicenses: 225,         // MonthlyLicensesAndSalesToolsCostPerSDR (in-house only)
      recruitmentCostPerSDR: 7200,
      onboardingCostPerSDR: 8800,
      monthlyTurnoverRatePct: 30 / 12, // percent per month
      outsourceMonthlyFee: 11500    // MonthlyFeePerSDR (outsourcing only)
    };

    const outsourceAnnualPerSDR = 12 * DEFAULTS.outsourceMonthlyFee;

    function annualInHousePerSDR(salary, stateCode) {
      const totalPayrollRate = DEFAULTS.basePayrollPct + (stateTaxRates[stateCode] || 0);
      const commission = (stateTotalCompRates && stateTotalCompRates[stateCode]) || DEFAULTS.commission;
      const input = {
        YearlySalaryPerSDR: salary,
        AvgYearlyCommissionsPerSDR: commission,
        PayrollTaxRate: totalPayrollRate,
        SDRManagementCostPerYear: DEFAULTS.managerCostPerYear,
        SDRsSeekingToHire: DEFAULTS.sdrsSeekingToHire,
        BenefitsRate: DEFAULTS.benefitsRatePct
      };

      const r = computeCostsForInput(input);

      const monthlySalary = salary / 12;
      const monthlyCommissions = commission / 12;
      const monthlyPayrollTax = r.payrollTaxPerSDRPerYear / 12;
      const monthlyBenefits = r.benefitsCostPerSDRPerYear / 12;
      const monthlyManagement = r.managerCostAllocationPerSDRPerYear / 12;
      const monthlyInfra = r.MonthlyInfrastructureAndFacilitiesCostPerSDRPerMonth;
      const monthlyRecruiting = (DEFAULTS.recruitmentCostPerSDR * DEFAULTS.monthlyTurnoverRatePct) / 100;
      const monthlyOnboarding = (DEFAULTS.onboardingCostPerSDR * DEFAULTS.monthlyTurnoverRatePct) / 100;

      const totalDirectMonthly = monthlySalary + monthlyCommissions + monthlyPayrollTax + monthlyBenefits + DEFAULTS.monthlyLicenses;
      const totalIndirectMonthly = monthlyManagement + monthlyInfra + monthlyRecruiting + monthlyOnboarding;
      return (totalDirectMonthly + totalIndirectMonthly) * 12;
    }

    function findBreakEvenSalary(stateCode) {
      const target = outsourceAnnualPerSDR;
      let low = 0;
      let high = 400000;
      let fLow = annualInHousePerSDR(low, stateCode) - target;
      let fHigh = annualInHousePerSDR(high, stateCode) - target;

      if (fLow > 0 && fHigh > 0) return 0; // always more expensive than outsourcing
      if (fLow < 0 && fHigh < 0) return null; // always cheaper than outsourcing within range

      for (let i = 0; i < 60; i++) {
        const mid = (low + high) / 2;
        const fMid = annualInHousePerSDR(mid, stateCode) - target;
        if (Math.abs(fMid) < 1e-3) return mid;
        if ((fLow <= 0 && fMid <= 0) || (fLow >= 0 && fMid >= 0)) {
          low = mid; fLow = fMid;
        } else {
          high = mid; fHigh = fMid;
        }
      }
      return (low + high) / 2;
    }

    const results = states.map(state => {
      const stateTaxPct = (stateTaxRates[state] || 0);
      const totalPayrollPct = DEFAULTS.basePayrollPct + stateTaxPct;
      const referenceSalary = stateSalaryRates[state] || 65000;
      const inHouseAnnualAtReference = Math.round(annualInHousePerSDR(referenceSalary, state));
      const breakEvenSalary = findBreakEvenSalary(state);
      return {
        state,
        stateTaxPct: stateTaxPct,
        payrollTaxPctTotal: totalPayrollPct,
        referenceSalary: referenceSalary,
        inHouseAnnualAtReference,
        breakEvenSalary,
        isBreakEvenAboveReference: breakEvenSalary == null ? '' : (breakEvenSalary > referenceSalary ? 'Yes' : '')
      };
    }).sort((a, b) => a.state.localeCompare(b.state));

    renderBreakEvenTable(results, outsourceAnnualPerSDR);
  }

  function renderBreakEvenTable(results, outsourceAnnualPerSDR) {
    const headers = [
      'State',
      'State Payroll Tax %',
      'Total Payroll Tax %',
      'Reference Salary',
      'In-House Annual @Ref',
      'Break-even Salary',
      'Break-even > Ref?'
    ];
    const rows = results.map(r => [
      r.state,
      r.stateTaxPct.toFixed(2),
      r.payrollTaxPctTotal.toFixed(2),
      Math.round(r.referenceSalary),
      r.inHouseAnnualAtReference,
      r.breakEvenSalary == null ? 'N/A' : Math.round(r.breakEvenSalary),
      r.isBreakEvenAboveReference
    ]);

    const tableHtml = [
      '<div class="test-summary">States: ' + results.length + ' — Outsource annual per SDR assumed: $' + outsourceAnnualPerSDR + '</div>',
      '<div class="table-wrapper" style="overflow:auto; max-height:60vh; border:1px solid #ddd;">',
      '<table class="test-table" style="border-collapse:collapse; width:100%; font-size:12px;">',
      '<thead><tr>',
      headers.map(h => '<th style="position:sticky; top:0; background:#fafafa; border:1px solid #ddd; padding:6px; text-align:left;">' + h + '</th>').join(''),
      '</tr></thead>',
      '<tbody>',
      rows.map(cols => '<tr>' + cols.map(v => '<td style="border:1px solid #eee; padding:6px;">' + String(v) + '</td>').join('') + '</tr>').join(''),
      '</tbody></table></div>'
    ].join('');

    resultsContainer.innerHTML = tableHtml;
    resultsContainer.scrollIntoView({ behavior: 'smooth' });
  }

  function tableToCsv(table) {
    const rows = table.querySelectorAll('tr');
    const data = [];
    rows.forEach(tr => {
      const cols = tr.querySelectorAll('th,td');
      const row = [];
      cols.forEach(td => {
        let text = td.textContent.trim();
        if (text.includes('"') || text.includes(',') || text.includes('\n')) {
          text = '"' + text.replace(/"/g, '""') + '"';
        }
        row.push(text);
      });
      data.push(row.join(','));
    });
    return data.join('\n');
  }

  function downloadCsv(csvText, filename) {
    const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
});


