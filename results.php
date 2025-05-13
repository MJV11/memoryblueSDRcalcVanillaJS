<?php
// Get all parameters from URL
$formData = [
    'YearlySalaryPerSDR' => isset($_GET['YearlySalaryPerSDR']) ? floatval($_GET['YearlySalaryPerSDR']) : 0,
    'AvgYearlyCommissionsPerSDR' => isset($_GET['AvgYearlyCommissionsPerSDR']) ? floatval($_GET['AvgYearlyCommissionsPerSDR']) : 0,
    'PayrollTaxRate' => isset($_GET['PayrollTaxRate']) ? floatval($_GET['PayrollTaxRate']) : 0,
    'SDRManagementCostPerYear' => isset($_GET['SDRManagementCostPerYear']) ? floatval($_GET['SDRManagementCostPerYear']) : 0,
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
    'payrollTaxPerSDRPerYear' => isset($_GET['payrollTaxPerSDRPerYear']) ? floatval($_GET['payrollTaxPerSDRPerYear']) : 0,
    'benefitsCostPerSDRPerYear' => isset($_GET['benefitsCostPerSDRPerYear']) ? floatval($_GET['benefitsCostPerSDRPerYear']) : 0,
    'MonthlyInfrastructureAndFacilitiesCostPerSDRPerMonth' => isset($_GET['MonthlyInfrastructureAndFacilitiesCostPerSDRPerMonth']) ? floatval($_GET['MonthlyInfrastructureAndFacilitiesCostPerSDRPerMonth']) : 0,
    'managerCostAllocationPerSDRPerYear' => isset($_GET['managerCostAllocationPerSDRPerYear']) ? floatval($_GET['managerCostAllocationPerSDRPerYear']) : 0,
    'yearlyDirectCostPerSDR' => isset($_GET['yearlyDirectCostPerSDR']) ? floatval($_GET['yearlyDirectCostPerSDR']) : 0,
    'monthlyDirectCostPerSDR' => isset($_GET['monthlyDirectCostPerSDR']) ? floatval($_GET['monthlyDirectCostPerSDR']) : 0,
    'yearlyIndirectCostPerSDR' => isset($_GET['yearlyIndirectCostPerSDR']) ? floatval($_GET['yearlyIndirectCostPerSDR']) : 0,
    'monthlyIndirectCostPerSDR' => isset($_GET['monthlyIndirectCostPerSDR']) ? floatval($_GET['monthlyIndirectCostPerSDR']) : 0,
    'totalMonthlyInHouseCostPerSDR' => isset($_GET['totalMonthlyInHouseCostPerSDR']) ? floatval($_GET['totalMonthlyInHouseCostPerSDR']) : 0
];

$currency = isset($_GET['currency']) ? htmlspecialchars($_GET['currency']) : 'USD';

// Function to format currency based on selected currency
function formatCurrency($value, $currency)
{
    return (new NumberFormatter('en_US', NumberFormatter::CURRENCY))->formatCurrency($value, $currency);
}

// Function to format percentage
function formatPercentage($value)
{
    return number_format($value, 1) . '%';
}

// Calculate total monthly cost for all SDRs if they were in-house
$totalMonthlyCostInHouse = $results['totalMonthlyInHouseCostPerSDR'] * $formData['SDRsSeekingToHire'];

// Calculate MemoryBlue total monthly cost
$totalMonthlyCostMemoryBlue = $fixedData['MonthlyFeePerSDR'] * $formData['SDRsSeekingToHire'];

// Calculate yearly costs
$totalYearlyCostInHouse = $totalMonthlyCostInHouse * 12;
$totalYearlyCostMemoryBlue = $totalMonthlyCostMemoryBlue * 12;

// Calculate cost difference
$monthlyCostDifference = $totalMonthlyCostInHouse - $totalMonthlyCostMemoryBlue;
$yearlyCostDifference = $monthlyCostDifference * 12;

// Calculate percentage savings
$monthlySavingsPercentage = ($monthlyCostDifference / $totalMonthlyCostInHouse) * 100;
$yearlySavingsPercentage = ($yearlyCostDifference / $totalYearlyCostInHouse) * 100;

// Calculate one-time startup costs
$totalStartupCostInHouse = $fixedData['RecruitmentCostPerSDR'] + $fixedData['OnboardingAndTrainingCostPerSDR'];

// Calculate first year costs
$inHouseFirstYearCostPerSDR = ($results['totalMonthlyInHouseCostPerSDR'] * 12) + $totalStartupCostInHouse;
$memoryBlueFirstYearCostPerSDR = $fixedData['MonthlyFeePerSDR'] * 12;

// Calculate subsequent year costs
$inHouseSubsequentYearCost = $results['totalMonthlyInHouseCostPerSDR'] * 12;
$memoryBlueSubsequentYearCost = $fixedData['MonthlyFeePerSDR'] * 12;

// Calculate yearly savings per SDR
$subsequentYearlySavingsPerSDR = $inHouseSubsequentYearCost - $memoryBlueSubsequentYearCost;
$firstYearSavingsPerSDR = $inHouseFirstYearCostPerSDR - $memoryBlueFirstYearCostPerSDR;

// Calculate total yearly savings for all SDRs
$totalSubsequentYearlySavings = $subsequentYearlySavingsPerSDR * $formData['SDRsSeekingToHire'];

// Calculate monthly direct costs breakdown
$monthlySalary = $formData['YearlySalaryPerSDR'] / 12;
$monthlyCommissions = $formData['AvgYearlyCommissionsPerSDR'] / 12;
$monthlyPayrollTax = $results['payrollTaxPerSDRPerYear'] / 12;
$monthlyBenefits = $results['benefitsCostPerSDRPerYear'] / 12;

// Calculate monthly indirect costs breakdown
$monthlyManagement = $results['managerCostAllocationPerSDRPerYear'] / 12;
$monthlyRecruiting = ($fixedData['RecruitmentCostPerSDR'] * $fixedData['MonthlyTurnoverRate'] / 100);
$monthlyOnboarding = ($fixedData['OnboardingAndTrainingCostPerSDR'] * $fixedData['MonthlyTurnoverRate'] / 100);

// Calculate total direct monthly cost
$totalDirectMonthlyCost = $monthlySalary + $monthlyCommissions + $monthlyPayrollTax + $monthlyBenefits + $fixedData['MonthlyLicensesAndSalesToolsCostPerSDR'];

// Calculate total indirect monthly cost
$totalIndirectMonthlyCost = $monthlyManagement + $results['MonthlyInfrastructureAndFacilitiesCostPerSDRPerMonth'] + $monthlyRecruiting + $monthlyOnboarding;
?>

<div class="columns">


    <div>
        <h3>Monthly Direct Costs</h3>
        <p>memoryBlue Fee: <?php echo formatCurrency($fixedData['MonthlyFeePerSDR'], $currency); ?></p>
        <p>Salary: <?php echo formatCurrency($monthlySalary, $currency); ?></p>
        <p>Commissions: <?php echo formatCurrency($monthlyCommissions, $currency); ?></p>
        <p>Payroll Tax: <?php echo formatCurrency($monthlyPayrollTax, $currency); ?></p>
        <p>Benefits: <?php echo formatCurrency($monthlyBenefits, $currency); ?></p>
        <p>Tools and Licenses:
            <?php echo formatCurrency($fixedData['MonthlyLicensesAndSalesToolsCostPerSDR'], $currency); ?></p>
        <p><strong>Total Direct Monthly Cost: <?php echo formatCurrency($totalDirectMonthlyCost, $currency); ?></strong>
        </p>
    </div>

    <div>
        <h3>Monthly Indirect Costs</h3>
        <p>Management: <?php echo formatCurrency($monthlyManagement, $currency); ?></p>
        <p>Infrastructure:
            <?php echo formatCurrency($results['MonthlyInfrastructureAndFacilitiesCostPerSDRPerMonth'], $currency); ?>
        </p>
        <p>Recruiting: <?php echo formatCurrency($monthlyRecruiting, $currency); ?></p>
        <p>Onboarding: <?php echo formatCurrency($monthlyOnboarding, $currency); ?></p>
        <p><strong>Total Indirect Monthly Cost:
                <?php echo formatCurrency($totalIndirectMonthlyCost, $currency); ?></strong></p>
    </div>

    <div>
        <h3>Startup Costs</h3>
        <p>Recruitment Cost: <?php echo formatCurrency($fixedData['RecruitmentCostPerSDR'], $currency); ?></p>
        <p>Onboarding Cost: <?php echo formatCurrency($fixedData['OnboardingAndTrainingCostPerSDR'], $currency); ?></p>
        <p><strong>Total Startup Cost: <?php echo formatCurrency($totalStartupCostInHouse, $currency); ?></strong></p>
    </div>

    <div>
        <h3>Yearly Costs</h3>
        <p>In-House First Year Cost per SDR: <?php echo formatCurrency($inHouseFirstYearCostPerSDR, $currency); ?></p>
        <p>MemoryBlue First Year Cost per SDR: <?php echo formatCurrency($memoryBlueFirstYearCostPerSDR, $currency); ?>
        </p>
        <p>In-House Subsequent Year Cost per SDR: <?php echo formatCurrency($inHouseSubsequentYearCost, $currency); ?>
        </p>
        <p>MemoryBlue Subsequent Year Cost per SDR:
            <?php echo formatCurrency($memoryBlueSubsequentYearCost, $currency); ?></p>
    </div>

    <div>
        <h3>Savings</h3>
        <p>First Year Savings per SDR: <?php echo formatCurrency($firstYearSavingsPerSDR, $currency); ?></p>
        <p>Subsequent Year Savings per SDR: <?php echo formatCurrency($subsequentYearlySavingsPerSDR, $currency); ?></p>
        <p>Total Yearly Savings: <?php echo formatCurrency($totalSubsequentYearlySavings, $currency); ?></p>
        <p>Yearly Savings Percentage: <?php echo formatPercentage($yearlySavingsPercentage); ?></p>
    </div>
</div>
<button id="download-pdf-button">Download PDF</button>
<script>
    document.getElementById('download-pdf-button').addEventListener('click', async () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'pt', 'a4');

        const content = document.querySelector('.columns');
        if (!content) {
            alert("Could not find .columns section to export.");
            return;
        }

        // Render the element as canvas (high DPI for sharpness)
        const canvas = await html2canvas(content, {
            scale: 10 
        });

        const imgData = canvas.toDataURL('image/png');

        // Convert canvas dimensions to A4 PDF scale
        const pageWidth = 595.28; // A4 width in pt
        const pageHeight = 841.89; // A4 height in pt
        const imgWidth = pageWidth;
        const imgHeight = canvas.height * imgWidth / canvas.width;

        let heightLeft = imgHeight;
        let position = 0;

        // First page
        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        // Add more pages if needed
        while (heightLeft > 0) {
            position -= pageHeight;
            doc.addPage();
            doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        doc.save('results.pdf');
    });
</script>


<!-- html2canvas and jsPDF -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>