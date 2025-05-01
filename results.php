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

// Function to format currency
function formatCurrency($value, $currency) {
    $symbol = [
        'USD' => '$',
        'EUR' => '€',
        'GBP' => '£',
        'JPY' => '¥',
        'AUD' => 'A$',
        'CAD' => 'C$'
    ];
    
    $currencySymbol = isset($symbol[$currency]) ? $symbol[$currency] : '$';
    
    if ($currency === 'JPY') {
        return $currencySymbol . number_format($value, 0);
    }
    
    return $currencySymbol . number_format($value, 0);
}

// Function to format percentage
function formatPercentage($value) {
    return number_format($value, 1) . '%';
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cost Comparison Results</title>
    <link rel="stylesheet" href="path-to-your-css/Form.css">
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
        }
        .calc-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .calc-table th, .calc-table td {
            padding: 8px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        .calc-table th {
            background-color: #f2f2f2;
        }
        .in-house-entry {
            background-color: #f0f7ff;
        }
        .memoryblue-entry {
            background-color: #fff0f0;
        }
        .font-semisemibold {
            font-weight: 600;
        }
        .savings-entry {
            color: #006400;
        }
        .justify-center {
            text-align: center;
        }
        .justify-left {
            text-align: left;
        }
        .table-subheading {
            margin-top: 30px;
            margin-bottom: 10px;
            color: #333;
        }
        .calc-results {
            margin-bottom: 30px;
            color: #1a1a1a;
        }
        .info-button {
            position: relative;
            display: inline-block;
            width: 20px;
            height: 20px;
            background-color: #f0f0f0;
            border-radius: 50%;
            text-align: center;
            line-height: 20px;
            cursor: help;
        }
        .tooltip {
            display: none;
            position: absolute;
            background-color: #333;
            color: #fff;
            padding: 10px;
            border-radius: 5px;
            width: 200px;
            z-index: 100;
            top: -10px;
            left: 30px;
        }
        .info-button:hover .tooltip {
            display: block;
        }
        .last {
            margin-top: 20px;
            margin-bottom: 40px;
            line-height: 1.5;
        }
        @media print {
            .no-print {
                display: none;
            }
        }
    </style>
</head>
<body>
    <div class="export-table">
        <h2 class="calc-results">Cost Comparison Results</h2>
        
        <div class="no-print">
            <button onclick="window.print()">Print Results</button>
            <a href="javascript:history.back()">Back to Calculator</a>
        </div>
        
        <h3 class="table-subheading">Direct Monthly Costs per SDR</h3>
        <table class="calc-table">
            <thead>
                <tr>
                    <th></th>
                    <th class="in-house-entry">In-House</th>
                    <th class="memoryblue-entry">MemoryBlue</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Monthly Fee:</td>
                    <td class="justify-center"></td>
                    <td class="justify-center"><?php echo formatCurrency($fixedData['MonthlyFeePerSDR'], $currency); ?></td>
                </tr>
                <tr>
                    <td>Salary:</td>
                    <td class="justify-center"><?php echo formatCurrency($formData['YearlySalaryPerSDR'] / 12, $currency); ?></td>
                    <td class="justify-center"></td>
                </tr>
                <tr>
                    <td>Commissions:</td>
                    <td class="justify-center"><?php echo formatCurrency($formData['AvgYearlyCommissionsPerSDR'] / 12, $currency); ?></td>
                    <td class="justify-center"></td>
                </tr>
                <tr>
                    <td>Payroll Tax:</td>
                    <td class="justify-center"><?php echo formatCurrency($results['payrollTaxPerSDR'] / 12, $currency); ?></td>
                    <td class="justify-center"></td>
                </tr>
                <tr>
                    <td>Benefits:</td>
                    <td class="justify-center"><?php echo formatCurrency($results['benefitsCostPerSDR'] / 12, $currency); ?></td>
                    <td class="justify-center"></td>
                </tr>
                <tr>
                    <td>Tools and Licenses:</td>
                    <td class="justify-center"><?php echo formatCurrency($fixedData['MonthlyLicensesAndSalesToolsCostPerSDR'], $currency); ?></td>
                    <td class="justify-center"></td>
                </tr>
                <tr>
                    <td class="font-semisemibold">Total Direct Cost:</td>
                    <td class="justify-center font-semisemibold">
                        <?php 
                        $totalDirect = $fixedData['MonthlyLicensesAndSalesToolsCostPerSDR'] + 
                                     $results['benefitsCostPerSDR'] / 12 + 
                                     $results['payrollTaxPerSDR'] / 12 + 
                                     $formData['AvgYearlyCommissionsPerSDR'] / 12 + 
                                     $formData['YearlySalaryPerSDR'] / 12;
                        echo formatCurrency($totalDirect, $currency); 
                        ?>
                    </td>
                    <td class="justify-center font-semisemibold"><?php echo formatCurrency($fixedData['MonthlyFeePerSDR'], $currency); ?></td>
                </tr>
            </tbody>
        </table>

        <h3 class="table-subheading">Indirect Monthly Costs per SDR</h3>
        <table class="calc-table">
            <!-- Similar structure for other tables -->
            <thead>
                <tr>
                    <th></th>
                    <th class="in-house-entry">In-House</th>
                    <th class="memoryblue-entry">MemoryBlue</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Management:</td>
                    <td class="justify-center"><?php echo formatCurrency($results['managerCostAllocation'] / 12, $currency); ?></td>
                    <td class="justify-center"></td>
                </tr>
                <tr>
                    <td>Infrastructure:</td>
                    <td class="justify-center"><?php echo formatCurrency($results['MonthlyInfrastructureAndFacilitiesCostPerSDR'], $currency); ?></td>
                    <td class="justify-center"></td>
                </tr>
                <tr>
                    <td>Recruiting:</td>
                    <td class="justify-center">
                        <?php echo formatCurrency($fixedData['RecruitmentCostPerSDR'] * $fixedData['MonthlyTurnoverRate'] / 100, $currency); ?>
                    </td>
                    <td class="justify-center"></td>
                </tr>
                <tr>
                    <td>Onboarding:</td>
                    <td class="justify-center">
                        <?php echo formatCurrency($fixedData['OnboardingAndTrainingCostPerSDR'] * $fixedData['MonthlyTurnoverRate'] / 100, $currency); ?>
                    </td>
                    <td class="justify-center"></td>
                </tr>
                <tr>
                    <td class="font-semisemibold">Total Indirect Cost:</td>
                    <td class="justify-center font-semisemibold">
                        <?php 
                        $totalIndirect = $results['MonthlyInfrastructureAndFacilitiesCostPerSDR'] + 
                                       $results['managerCostAllocation'] / 12 +
                                       ($fixedData['OnboardingAndTrainingCostPerSDR'] * $fixedData['MonthlyTurnoverRate'] / 100) +
                                       ($fixedData['RecruitmentCostPerSDR'] * $fixedData['MonthlyTurnoverRate'] / 100);
                        echo formatCurrency($totalIndirect, $currency); 
                        ?>
                    </td>
                    <td class="justify-center"></td>
                </tr>
            </tbody>
        </table>

        <!-- Additional tables for One-Time Startup Costs, First Year Costs, and Savings -->
        <!-- ... truncated for brevity ... -->

        <h3 class="table-subheading">Savings</h3>
        <table class="calc-table">
            <tbody>
                <tr>
                    <td class="font-semisemibold">Yearly Savings per SDR:</td>
                    <td class="font-semisemibold">
                        <?php 
                        $yearlySavings = $results['totalMonthlyInHouse'] * 12 - $fixedData['MonthlyFeePerSDR'] * 12;
                        echo formatCurrency($yearlySavings, $currency); 
                        ?>
                    </td>
                </tr>
                <tr>
                    <td class="font-semisemibold savings-entry">
                        Yearly Savings for <?php echo $formData['SDRsSeekingToHire']; ?> SDRs:
                    </td>
                    <td class="font-semisemibold">
                        <?php 
                        $totalSavings = $yearlySavings * $formData['SDRsSeekingToHire'];
                        echo formatCurrency($totalSavings, $currency); 
                        ?>
                    </td>
                </tr>
                <tr>
                    <td class="font-semisemibold">Yearly Savings Percentage:</td>
                    <td class="font-semisemibold">
                        <?php 
                        $savingsPercentage = ($yearlySavings / ($results['totalMonthlyInHouse'] * 12)) * 100;
                        echo formatPercentage($savingsPercentage); 
                        ?>
                    </td>
                </tr>
            </tbody>
        </table>

        <h3 class="table-subheading">Additional Considerations</h3>
        <div class="last">
            Outsourcing to experienced professionals often yields higher pipeline throughput than starting
            an in-house team. Outsourcing allows clients to rapidly scale up and down, including for seasonal sales efforts.
            Outsourcing offers flexibility in hiring and firing, but without worrying about finding the right fit for your team
            or developing the right culture.
            Additionally, outsourcing avoids the opportunity cost of lost revenue when training the initial team.
            The outsourced team has significantly shorter ramp up time, and can jump right into the pipeline. Similarly, outsourcing avoids lost revenue to turnover
            and spending on unproductive time. If you think outsourcing may be right for your firm, email us at
            sales@memoryblue.com
        </div>
    </div>

    <script>
        // Simple script to make tooltips work
        document.addEventListener('DOMContentLoaded', function() {
            const infoButtons = document.querySelectorAll('.info-button');
            
            infoButtons.forEach(button => {
                button.addEventListener('mouseover', function() {
                    this.querySelector('.tooltip').style.display = 'block';
                });
                
                button.addEventListener('mouseout', function() {
                    this.querySelector('.tooltip').style.display = 'none';
                });
            });
        });
    </script>
</body>
</html>