// Insourcing vs. Outsourcing Calculator
document.addEventListener('DOMContentLoaded', function() {
  // Initial form data with default values
  let formData = {
    YearlySalaryPerSDR: 65000,
    AvgYearlyCommissionsPerSDR: 36000,
    PayrollTaxRate: 7.65, // Base US payroll tax rate
    SDRManagementCostPerYear: 137000,
    SDRsSeekingToHire: 7,
    BenefitsRate: 20, // Default 20% of salary for benefits
    State: '',
  };

  // Fixed data values
  let fixedData = {
    MonthlyFeePerSDR: 11500, // MemoryBlue offers services at 11500 monthly per SDR contracted
    MonthlyLicensesAndSalesToolsCostPerSDR: 225,
    RecruitmentCostPerSDR: 7200,
    OnboardingAndTrainingCostPerSDR: 8800,
    MonthlyTurnoverRate: 30 / 12, // 30% is the bottom of the national yearly average
  };

  // Currency handling
  let currencyRates = {};
  let currentCurrency = "USD";

  // these are the floors of an employer payroll tax taken on May 9th 2025
  // because normally payroll taxes only count toward the first <10k dollars, i have divided the 
  // real rates by their proportion of taxable base to average income to account for recombination later
  const stateTaxRates = {
      'AL': 0.2, 'AK': 1.0, 'AZ': 2.04, 'AR': 0.2, 'CA': 0.0,
      'CO': 0.4, 'CT': 0.5, 'DE': 0.02, 'FL': 0.0, 'GA': 0.008,
      'HI': 0.1, 'ID': 0.225, 'IL': 0.16, 'IN': 0.08, 'IA': 0.0,
      'KS': 0.0, 'KY': 0.05, 'LA': 0.001, 'ME': 0.05, 'MD': 0.037,
      'MA': 0.25, 'MI': 0.01, 'MN': 0.0, 'MS': 0.0, 'MO': 0.0,
      'MT': 0.0, 'NE': 0.0, 'NV': 0.25, 'NH': 0.02, 'NJ': 0.61,
      'NM': 0.15, 'NY': 0.4, 'NC': 0.00, 'ND': 0.00, 'OH': 0.05,
      'OK': 0.1, 'OR': 0.9, 'PA': .23, 'RI': 0.5, 'SC': 0.01,
      'SD': 0.0, 'TN': 0.0, 'TX': 0.04, 'UT': 0.15, 'VT': 0.1,
      'VA': 0.01, 'WA': 0.0, 'WV': .3, 'WI': 0.0, 'WY': 0.0
  };


  // Fetch currency rates on page load
  fetchCurrencyRates();

  // Cache form elements
  const form = document.getElementById('calculator-form');
  const currencySelect = document.getElementById('Currency');
  const resetButton = document.getElementById('reset-button');
  const calculateButton = document.getElementById('calculate-button');
  const stateSelect = document.getElementById('State');

  // Add event listeners
  if (currencySelect) {
    currencySelect.addEventListener('change', handleCurrencyChange);
  }

  if (resetButton) {
    resetButton.addEventListener('click', handleReset);
  }

  if (stateSelect) {
      stateSelect.addEventListener('change', handleStateChange);
  }

  if (form) {
    form.addEventListener('submit', handleSubmit);
    
    // Add change event listeners to all input fields
    const inputFields = form.querySelectorAll('input[type="number"]');
    inputFields.forEach(input => {
      input.addEventListener('change', function(e) {
        handleChange(e.target.name, e.target.value);
      });
    });
  }

  /**
   * Handle state change in dropdown
   * @param {Event} e - The state change event
   */
  function handleStateChange(e) {
    const stateCode = e.target.value;
    formData.State = stateCode;
    updateTaxRateForState(stateCode);
  }

  /**
   * Fetches currency rates from API
   */
  function fetchCurrencyRates() {
    fetch("https://api.frankfurter.dev/v1/latest?base=USD&symbols=EUR,GBP,JPY,AUD,CAD")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.rates) {
          console.log("Successfully fetched currency rates", data.rates);
          currencyRates = data.rates;
          // Add USD to the rates for easier calculations
          currencyRates.USD = 1.0;
        } else {
          console.log("Error fetching data, using hardcoded rates");
          setHardcodedRates();
        }
      })
      .catch((error) => {
        console.error("Error fetching currency rates:", error);
        setHardcodedRates();
      });
  }

  /**
   * Sets hardcoded currency rates in case API fails
   */
  function setHardcodedRates() {
    currencyRates = {
      USD: 1.0,
      EUR: 0.87928,
      GBP: 0.74897,
      JPY: 143.04,
      AUD: 1.5649,
      CAD: 1.3829
    };
  }

  /**
   * Handles change in currency selection
   * @param {Event} e - The currency change event
   */
  function handleCurrencyChange(e) {
    const newCurrency = e.target.value;

    if (!currencyRates || !currencyRates[newCurrency]) {
      console.warn("Currency rate not available yet.");
      setHardcodedRates();
    }
    
    const conversionRate = currencyRates[newCurrency];

    if (!conversionRate) return;

    // Convert all USD fixed data values to the new currency
    fixedData = {
      ...fixedData,
      MonthlyFeePerSDR: Math.round(11500 * conversionRate),
      MonthlyLicensesAndSalesToolsCostPerSDR: Math.round(225 * conversionRate),
      RecruitmentCostPerSDR: Math.round(7200 * conversionRate),
      OnboardingAndTrainingCostPerSDR: Math.round(8800 * conversionRate),
    };

    currentCurrency = newCurrency;
    clearErrors();
  }

  /**
   * Handles changes to form input values
   * @param {string} name - The name of the field that changed
   * @param {number} value - The new value of the field
   */
  function handleChange(name, value) {
    const numericValue = parseFloat(value) || 0;
    formData[name] = numericValue;
    
    clearErrorForField(name);
  }

  /**
   * Extract the state tax calculation to a separate function
   * @param {string} state - The state code
   */
  function updateTaxRateForState(state) {
    if (!state) return;
    
    // Update tax rate based on selected state
    const stateTaxRate = stateTaxRates[state] || 0;
    const totalTaxRate = 7.65 + stateTaxRate; // Base US rate (7.65%) + state rate
    
    const taxRateInput = document.getElementById('PayrollTaxRate');
    if (taxRateInput) {
      taxRateInput.value = totalTaxRate.toFixed(2);
      formData.PayrollTaxRate = totalTaxRate;
    }
  }

  /**
   * Calculates costs based on form data
   * @returns {Object} An object containing the calculated costs
   */
  function calculateCosts() {
    // Destructure values for easier reference
    const {
      YearlySalaryPerSDR,
      AvgYearlyCommissionsPerSDR,
      PayrollTaxRate,
      SDRManagementCostPerYear,
      SDRsSeekingToHire,
      BenefitsRate
    } = formData;

    const {
      MonthlyLicensesAndSalesToolsCostPerSDR,
      RecruitmentCostPerSDR,
      OnboardingAndTrainingCostPerSDR,
      MonthlyTurnoverRate,
    } = fixedData;

    // Calculate in-house costs
    const payrollTaxPerSDRPerYear = (YearlySalaryPerSDR + AvgYearlyCommissionsPerSDR) * (PayrollTaxRate / 100);
    const benefitsCostPerSDRPerYear = YearlySalaryPerSDR * (BenefitsRate / 100);
    const MonthlyInfrastructureAndFacilitiesCostPerSDRPerMonth = (YearlySalaryPerSDR * SDRsSeekingToHire + SDRManagementCostPerYear) / SDRsSeekingToHire * 0.1 / 12;

    // Calculate manager cost allocation
    const managerCostAllocationPerSDRPerYear = (SDRManagementCostPerYear / SDRsSeekingToHire);

    // Calculate total yearly direct cost per SDR
    const yearlyDirectCostPerSDR = YearlySalaryPerSDR + AvgYearlyCommissionsPerSDR +
      payrollTaxPerSDRPerYear + benefitsCostPerSDRPerYear + managerCostAllocationPerSDRPerYear;

    // Monthly direct cost per SDR
    const monthlyDirectCostPerSDR = yearlyDirectCostPerSDR / 12;

    const yearlyIndirectCostPerSDR = MonthlyInfrastructureAndFacilitiesCostPerSDRPerMonth
      + (OnboardingAndTrainingCostPerSDR * MonthlyTurnoverRate / 100) + (RecruitmentCostPerSDR * MonthlyTurnoverRate / 100)
      + MonthlyLicensesAndSalesToolsCostPerSDR;

    const monthlyIndirectCostPerSDR = yearlyIndirectCostPerSDR / 12;

    const totalMonthlyInHouseCostPerSDR = monthlyDirectCostPerSDR + monthlyIndirectCostPerSDR;

    return {
      payrollTaxPerSDRPerYear,
      benefitsCostPerSDRPerYear,
      MonthlyInfrastructureAndFacilitiesCostPerSDRPerMonth,
      managerCostAllocationPerSDRPerYear,
      yearlyDirectCostPerSDR,
      monthlyDirectCostPerSDR,
      yearlyIndirectCostPerSDR,
      monthlyIndirectCostPerSDR,
      totalMonthlyInHouseCostPerSDR,
    };
  }

  /**
   * Validates form inputs
   */
  function validateForm() {
    let isValid = true;
    clearErrors();

    // No negative numbers
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== 'State' && value < 0) {
        displayError(key, "Value cannot be negative");
        isValid = false;
      }
    });

    // Validate specific fields
    if (formData.SDRsSeekingToHire <= 0) {
      displayError('SDRsSeekingToHire', "Must be hiring at least 1 SDR");
      isValid = false;
    }

    if (formData.PayrollTaxRate <= 0 || formData.PayrollTaxRate > 100) {
      displayError('PayrollTaxRate', "Tax rate must be between 0 and 100 percent");
      isValid = false;
    }

    if (formData.BenefitsRate < 0 || formData.BenefitsRate > 100) {
      displayError('BenefitsRate', "Benefits rate must be between 0 and 100 percent");
      isValid = false;
    }

    return isValid;
  }

  /**
   * Display error message for a field
   * @param {string} fieldName - The name of the field to display the error message
   * @param {string} message - The error message to display
   */
  function displayError(fieldName, message) {
    const errorElement = document.getElementById(`${fieldName}-error`);
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
    
    const inputElement = document.getElementById(fieldName);
    if (inputElement) {
      inputElement.classList.add('error-input');
    }
  }

  /**
   * Clear error for a specific field
   * @param {string} fieldName - The name of the field to clear the error form
   */
  function clearErrorForField(fieldName) {
    const errorElement = document.getElementById(`${fieldName}-error`);
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }
    
    const inputElement = document.getElementById(fieldName);
    if (inputElement) {
      inputElement.classList.remove('error-input');
    }
  }

  /**
   * Clear all error messages
   */
  function clearErrors() {
    const errorElements = document.querySelectorAll('[id$="-error"]');
    errorElements.forEach(el => {
      el.textContent = '';
      el.style.display = 'none';
    });
    
    const inputElements = document.querySelectorAll('input');
    inputElements.forEach(input => {
      input.classList.remove('error-input');
    });
  }

  /**
   * Format currency based on selected currency
   * @param {number} value - The value to format as currency
   * @returns {string} The formatted currency string
   */
  function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currentCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  /**
   * Format percentage value
   * @param {number} value - The value to format as a percentage
   * @returns {string} The formatted percentage string
   */
  function formatPercentage(value) {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100);
  }

  /**
   * Handle form submission
   * @param {Event} e - The form submission event
   */
  function handleSubmit(e) {
    e.preventDefault();
  
    // Validate all fields
    const isValid = validateForm();
  
    if (isValid) {
      const calculatedResults = calculateCosts();
      
      // Create URL parameters from all form data, fixed data, and calculated results
      const params = new URLSearchParams();
      
      // Add form data parameters
      Object.entries(formData).forEach(([key, value]) => {
        params.append(key, value);
      });
      
      // Add fixed data parameters
      Object.entries(fixedData).forEach(([key, value]) => {
        params.append(key, value);
      });
      
      // Add calculated results parameters
      Object.entries(calculatedResults).forEach(([key, value]) => {
        params.append(key, value);
      });
      
      // Add currency
      params.append('currency', currentCurrency);
      
      // Define the PHP results page URL
      const phpResultsPage = 'results.php';
      
      // Open a new tab/window with the PHP results page and all parameters
      window.open(`${phpResultsPage}?${params.toString()}`, '_blank');
    }
  }

  /**
   * Reset form to default values
   */
  function handleReset() {
    formData = {
      YearlySalaryPerSDR: 65000,
      AvgYearlyCommissionsPerSDR: 36000,
      PayrollTaxRate: 7.65,
      SDRManagementCostPerYear: 137000,
      SDRsSeekingToHire: 7,
      BenefitsRate: 20,
      State: '',
      City: ''
    };

    // Update the form inputs with reset values
    Object.entries(formData).forEach(([key, value]) => {
      const inputField = document.getElementById(key);
      if (inputField) {
        inputField.value = value;
      }
    });

    // Reset currency to USD
    if (currencySelect) {
      currencySelect.value = 'USD';
      
      // Trigger currency change to reset fixed data
      handleCurrencyChange({ target: { value: 'USD' } });
    }

    clearErrors();
  }
});