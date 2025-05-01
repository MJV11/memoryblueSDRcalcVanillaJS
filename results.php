<?php
// Get all parameters from URL
$formData = [
    'YearlySalaryPerSDR' => isset($_GET['YearlySalaryPerSDR']) ? floatval($_GET['YearlySalaryPerSDR']) : 0,
    'AvgYearlyCommissionsPerSDR' => isset($_GET['AvgYearlyCommissionsPerSDR']) ? floatval($_GET['AvgYearlyCommissionsPerSDR']) : 0,
    'PayrollTaxRate' => isset($_GET['PayrollTaxRate']) ? floatval($_GET['PayrollTaxRate']) : 0,
    'SDRManagementCost' => isset($_GET['SDRManagementCost']) ? floatval($_GET['SDRManagementCost']) : 0,
    'SDRsSeekingToHire' => isset($_GET['SDRsSeekingToHire']) ? intval($_GET['SDRsSeekingToHire']) : 0,
    'BenefitsRate' => isset($_GET['BenefitsRate']) ? floatval($_GET['BenefitsRate']) : 0
];

$fixedData = [
    'MonthlyFeePerSDR' => isset($_GET['MonthlyFeePerSDR']) ? floatval($_GET['MonthlyFeePerSDR']) : 0,
    'MonthlyLicensesAndSalesToolsCostPerSDR' => isset($_GET['MonthlyLicensesAndSalesToolsCostPerSDR']) ? floatval($_GET['MonthlyLicensesAndSalesToolsCostPerSDR']) : 0,
    'RecruitmentCostPerSDR' => isset($_GET['RecruitmentCostPerSDR']) ? floatval($_GET['RecruitmentCostPerSDR']) : 0,
    'OnboardingAndTrainingCostPerSDR' => isset($_GET['OnboardingAndTrainingCostPerSDR']) ? floatval($_GET['OnboardingAndTrainingCostPerSDR']) : 0,
    'MonthlyTurnoverRate' => isset($_GET['MonthlyTurnoverRate']) ? floatval($_GET['MonthlyTurnoverRate']) : 0
];

$results = [
    'payrollTaxPerSDR' => isset($_GET['payrollTaxPerSDR']) ? floatval($_GET['payrollTaxPerSDR']) : 0,
    'benefitsCostPerSDR' => isset($_GET['benefitsCostPerSDR']) ? floatval($_GET['benefitsCostPerSDR']) : 0,
    'MonthlyInfrastructureAndFacilitiesCostPerSDR' => isset($_GET['MonthlyInfrastructureAndFacilitiesCostPerSDR']) ? floatval($_GET['MonthlyInfrastructureAndFacilitiesCostPerSDR']) : 0,
    'managerCostAllocation' => isset($_GET['managerCostAllocation']) ? floatval($_GET['managerCostAllocation']) : 0,
    'yearlyDirectCostPerSDR' => isset($_GET['yearlyDirectCostPerSDR']) ? floatval($_GET['yearlyDirectCostPerSDR']) : 0,
    'monthlyDirectCostPerSDR' => isset($_GET['monthlyDirectCostPerSDR']) ? floatval($_GET['monthlyDirectCostPerSDR']) : 0,
    'totalMonthlyInHouse' => isset($_GET['totalMonthlyInHouse']) ? floatval($_GET['totalMonthlyInHouse']) : 0
];

$currency = isset($_GET['currency']) ? htmlspecialchars($_GET['currency']) : 'USD';
