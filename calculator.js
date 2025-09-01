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

  // numbers for the next two sections are a little fudgy because the data sources are not necessarily accurate and hard to retreive
  // given by google searching "what is the sdr salary in {state} exact figure glassdoor" on May 14, 2025. 
  const stateSalaryRates = {
    'AL': 57000, 'AK': 59000, 'AZ': 52000, 'AR': 55000, 'CA': 60000,
    'CO': 50000, 'CT': 55000, 'DE': 55000, 'FL': 50000, 'GA': 55000,
    'HI': 55000, 'ID': 53000, 'IL': 53000, 'IN': 53000, 'IA': 55000,
    'KS': 53000, 'KY': 51000, 'LA': 50000, 'ME': 60000, 'MD': 55000,
    'MA': 56000, 'MI': 56000, 'MN': 54000, 'MS': 51000, 'MO': 51000,
    'MT': 51000, 'NE': 53000, 'NV': 53000, 'NH': 53000, 'NJ': 55000,
    'NM': 55000, 'NY': 60000, 'NC': 53000, 'ND': 58000, 'OH': 52000,
    'OK': 50000, 'OR': 54000, 'PA': 27000, 'RI': 55000, 'SC': 54000,
    'SD': 55000, 'TN': 35000, 'TX': 54000, 'UT': 52000, 'VT': 57000,
    'VA': 51000, 'WA': 59000, 'WV': 48000, 'WI': 53000, 'WY': 52000
  };

  /** if you try to source these numbers, one thing you'll notice is that the metro areas differ wildly from the state writ large
   * to balance that, I am choosing the metro areas, assuming that that is where the majority of business will come from, and also
   * to keep the calculations profitable */ 
  // given by google searching "what is the sdr total compensation in {state} exact figure glassdoor" on May 14, 2025
  const stateTotalCompRates = {
    'AL': 39000, 'AK': 30000, 'AZ': 32000, 'AR': 36000, 'CA': 40000,
    'CO': 28000, 'CT': 27000, 'DE': 30000, 'FL': 37000, 'GA': 38000,
    'HI': 25000, 'ID': 25000, 'IL': 35000, 'IN': 36000, 'IA': 38000,
    'KS': 37000, 'KY': 34000, 'LA': 33000, 'ME': 40000, 'MD': 35000,
    'MA': 40000, 'MI': 35000, 'MN': 38000, 'MS': 36000, 'MO': 26000,
    'MT': 34000, 'NE': 39000, 'NV': 36000, 'NH': 36000, 'NJ': 35000,
    'NM': 30000, 'NY': 39000, 'NC': 39000, 'ND': 32000, 'OH': 30000,
    'OK': 25000, 'OR': 24000, 'PA': 51000, 'RI': 35000, 'SC': 36000,
    'SD': 25000, 'TN': 55000, 'TX': 34000, 'UT': 35000, 'VT': 32000,
    'VA': 29000, 'WA': 40000, 'WV': 33000, 'WI': 33000, 'WY': 35000
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
    updateFieldsForState(stateCode);
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
   * Fill suggestions for fields that have not been filled by state selection
   * @param {string} state - The state code
   */
  function updateFieldsForState(state) {
    if (!state) return;

    const stateTaxRate = stateTaxRates[state] || 0;
    const totalTaxRate = 7.65 + stateTaxRate; // Base US rate (7.65%) + state rate
    const taxRateInput = document.getElementById('PayrollTaxRate');
    if (taxRateInput) {
      taxRateInput.value = totalTaxRate.toFixed(2);
      formData.PayrollTaxRate = totalTaxRate;
    }

    const pay = stateSalaryRates[state] || 60000; 
    const payInput = document.getElementById('YearlySalaryPerSDR');
    if (payInput) {
      payInput.value = pay;
      formData.YearlySalaryPerSDR = pay;
    }

    const commission = stateTotalCompRates[state] || 35000; 
    const comInput = document.getElementById('AvgYearlyCommissionsPerSDR');
    if (comInput) {
      comInput.value = commission;
      formData.AvgYearlyCommissionsPerSDR = commission;
    }
  }

  /**
   * Pure function: calculates costs from provided input data
   * @param {Object} input - calculation inputs
   * @returns {Object} calculated costs
   */
  function computeCostsForInput(input) {
    const {
      YearlySalaryPerSDR,
      AvgYearlyCommissionsPerSDR,
      PayrollTaxRate,
      SDRManagementCostPerYear,
      SDRsSeekingToHire,
      BenefitsRate
    } = input;

    const payrollTaxPerSDRPerYear = (YearlySalaryPerSDR + AvgYearlyCommissionsPerSDR) * (PayrollTaxRate / 100);
    const benefitsCostPerSDRPerYear = YearlySalaryPerSDR * (BenefitsRate / 100);
    const MonthlyInfrastructureAndFacilitiesCostPerSDRPerMonth = (YearlySalaryPerSDR * SDRsSeekingToHire + SDRManagementCostPerYear) / SDRsSeekingToHire * 0.1 / 12;
    const managerCostAllocationPerSDRPerYear = (SDRManagementCostPerYear * (1 + (PayrollTaxRate / 100))) / SDRsSeekingToHire;

    return {
      payrollTaxPerSDRPerYear,
      benefitsCostPerSDRPerYear,
      MonthlyInfrastructureAndFacilitiesCostPerSDRPerMonth,
      managerCostAllocationPerSDRPerYear,
    };
  }

  /**
   * Calculates costs based on current form data
   * @returns {Object} An object containing the calculated costs
   */
  function calculateCosts() {
    return computeCostsForInput(formData);
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
    if (validateForm()) {
      const calculatedResults = calculateCosts();
      
      const params = new URLSearchParams();
      Object.entries(formData).forEach(([key, value]) => {
        params.append(key, value);
      });
      Object.entries(fixedData).forEach(([key, value]) => {
        params.append(key, value);
      });
      Object.entries(calculatedResults).forEach(([key, value]) => {
        params.append(key, value);
      });
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

  // Expose a minimal API for testing to consume
  window.Calculator = {
    computeCostsForInput: computeCostsForInput,
    stateTaxRates: stateTaxRates,
    stateSalaryRates: stateSalaryRates,
    stateTotalCompRates: stateTotalCompRates
  };
});