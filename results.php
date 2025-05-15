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
];

$currency = isset($_GET['currency']) ? htmlspecialchars($_GET['currency']) : 'USD';

/**
 * Summary of formatCurrency
 * @param mixed $value
 * @param mixed $currency
 * @return bool|string
 */
function formatCurrency($value, $currency)
{
    return (new NumberFormatter('en_US', NumberFormatter::CURRENCY))->formatCurrency($value, $currency);
}

/**
 * Summary of formatPercentage
 * @param mixed $value
 * @return string
 */
function formatPercentage($value)
{
    return number_format($value, 1) . '%';
}

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


// Calculate total monthly cost for all SDRs if they were in-house
$totalMonthlyCostInHouse = ($totalDirectMonthlyCost + $totalIndirectMonthlyCost) * $formData['SDRsSeekingToHire'];

// Calculate MemoryBlue total monthly cost
$totalMonthlyCostMemoryBlue = $fixedData['MonthlyFeePerSDR'] * $formData['SDRsSeekingToHire'];

// Calculate yearly costs
$totalYearlyCostInHouse = $totalMonthlyCostInHouse * 12;
$totalYearlyCostMemoryBlue = $totalMonthlyCostMemoryBlue * 12;

// Calculate percentage savings
$yearlySavingsPercentage = $totalMonthlyCostInHouse != 0 ? (($totalMonthlyCostInHouse - $totalMonthlyCostMemoryBlue) / $totalMonthlyCostInHouse) * 100 : 0;

// Calculate one-time startup costs
$totalStartupCostInHouse = $fixedData['RecruitmentCostPerSDR'] + $fixedData['OnboardingAndTrainingCostPerSDR'];

// Calculate first year costs
$inHouseFirstYearCostPerSDR = ($totalDirectMonthlyCost + $totalIndirectMonthlyCost) * 12 + $totalStartupCostInHouse;
$memoryBlueFirstYearCostPerSDR = $fixedData['MonthlyFeePerSDR'] * 12;

// Calculate subsequent year costs
$inHouseSubsequentYearCost = ($totalDirectMonthlyCost + $totalIndirectMonthlyCost) * 12;
$memoryBlueSubsequentYearCost = $fixedData['MonthlyFeePerSDR'] * 12;

// Calculate yearly savings per SDR
$subsequentYearlySavingsPerSDR = $inHouseSubsequentYearCost - $memoryBlueSubsequentYearCost;
$firstYearSavingsPerSDR = $inHouseFirstYearCostPerSDR - $memoryBlueFirstYearCostPerSDR;

// Calculate total yearly savings for all SDRs
$totalSubsequentYearlySavings = $subsequentYearlySavingsPerSDR * $formData['SDRsSeekingToHire'];
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
            <?php echo formatCurrency($fixedData['MonthlyLicensesAndSalesToolsCostPerSDR'], $currency); ?>
        </p>
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
            <?php echo formatCurrency($memoryBlueSubsequentYearCost, $currency); ?>
        </p>
    </div>

    <div>
        <h3>Savings</h3>
        <p>First Year Savings per SDR: <?php echo formatCurrency($firstYearSavingsPerSDR, $currency); ?></p>
        <p>Subsequent Year Savings per SDR: <?php echo formatCurrency($subsequentYearlySavingsPerSDR, $currency); ?></p>
        <p>Total Yearly Savings: <?php echo formatCurrency($totalSubsequentYearlySavings, $currency); ?></p>
        <p>Yearly Savings Percentage: <?php echo formatPercentage($yearlySavingsPercentage); ?></p>
    </div>

    <div class="chart-container" style="width: 100%; max-width: 800px; margin: 30px auto;">
        <h3>5-Year Cost Comparison per SDR: In-House vs. memoryBlue</h3>
        <canvas id="costComparisonChart"></canvas>
    </div>
</div>

<script>
    document.addEventListener('DOMContentLoaded', function () {
        // Get values from PHP variables (these would need to be passed from PHP to JS)
        const inHouseFirstYearCostPerSDR = <?php echo $inHouseFirstYearCostPerSDR; ?>;
        const memoryBlueFirstYearCostPerSDR = <?php echo $memoryBlueFirstYearCostPerSDR; ?>;
        const inHouseSubsequentYearCost = <?php echo $inHouseSubsequentYearCost; ?>;
        const sdrCount = <?php echo $formData['SDRsSeekingToHire']; ?>;
        const currency = "<?php echo $currency; ?>";

        // Create years array
        const years = [1, 2, 3, 4, 5];
        const inHouseCosts = [];
        const memoryBlueCosts = [];

        // Year 1 includes startup costs AND the first year operational costs for both options
        inHouseCosts.push(inHouseFirstYearCostPerSDR);
        memoryBlueCosts.push(memoryBlueFirstYearCostPerSDR);

        // Years 2-5 are just the yearly operational costs
        for (let i = 1; i <= years.length - 1; i++) {
            inHouseCosts.push(inHouseSubsequentYearCost);
            memoryBlueCosts.push(memoryBlueFirstYearCostPerSDR);
        }

        // Calculate cumulative costs
        const cumulativeInHouseCosts = [];
        const cumulativeMemoryBlueCosts = [];
        let runningInHouseTotal = 0;
        let runningMemoryBlueTotal = 0;

        years.forEach((year, index) => {
            runningInHouseTotal += inHouseCosts[index];
            runningMemoryBlueTotal += memoryBlueCosts[index];

            cumulativeInHouseCosts.push(runningInHouseTotal);
            cumulativeMemoryBlueCosts.push(runningMemoryBlueTotal);
        });

        // Format the data for the chart
        const yearLabels = years.map(year => "Year " + year);
        const inHouseCostsFormatted = cumulativeInHouseCosts.map(cost => Math.round(cost * 100) / 100);
        const memoryBlueCostsFormatted = cumulativeMemoryBlueCosts.map(cost => Math.round(cost * 100) / 100);

        // Create the chart
        const costCtx = document.getElementById('costComparisonChart').getContext('2d');
        const costChart = new Chart(costCtx, {
            type: 'line',
            data: {
                labels: yearLabels,
                datasets: [{
                    label: 'In-House Cumulative Cost',
                    data: inHouseCostsFormatted,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 2,
                    tension: 0.1
                }, {
                    label: 'memoryBlue Cumulative Cost',
                    data: memoryBlueCostsFormatted,
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 2,
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Cumulative Cost (' + currency + ')'
                        },
                        ticks: {
                            callback: function (value) {
                                return value.toLocaleString('en-US', {
                                    style: 'currency',
                                    currency: currency,
                                    maximumFractionDigits: 0
                                });
                            }
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Year'
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function (context) {
                                return context.dataset.label + ': ' +
                                    context.parsed.y.toLocaleString('en-US', {
                                        style: 'currency',
                                        currency: currency
                                    });
                            }
                        }
                    },
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    });
</script>
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
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js"></script>