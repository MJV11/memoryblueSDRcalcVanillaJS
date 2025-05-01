// Insourcing vs. Outsourcing Calculator
document.addEventListener('DOMContentLoaded', function() {
    // Initial form data with default values
    let formData = {
      YearlySalaryPerSDR: 65000,
      AvgYearlyCommissionsPerSDR: 36000,
      PayrollTaxRate: 7.65, // Percentage
      SDRManagementCost: 137000,
      SDRsSeekingToHire: 7,
      BenefitsRate: 20, // Default 20% of salary for benefits
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
  
    // Fetch currency rates on page load
    fetchCurrencyRates();
  
    // Cache form elements
    const form = document.getElementById('calculator-form');
    const currencySelect = document.getElementById('Currency');
    const resetButton = document.getElementById('reset-button');
    const calculateButton = document.getElementById('calculate-button');
  
    // Add event listeners
    if (currencySelect) {
      currencySelect.addEventListener('change', handleCurrencyChange);
    }
  
    if (resetButton) {
      resetButton.addEventListener('click', handleReset);
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
     */
    function handleChange(name, value) {
      // Convert input to number and ensure it's valid
      const numericValue = parseFloat(value) || 0;
  
      formData[name] = numericValue;
  
      // Clear error for this field
      clearErrorForField(name);
    }
  
    /**
     * Calculates costs based on form data
     */
    function calculateCosts() {
      // Destructure values for easier reference
      const {
        YearlySalaryPerSDR,
        AvgYearlyCommissionsPerSDR,
        PayrollTaxRate,
        SDRManagementCost,
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
      const payrollTaxPerSDR = (YearlySalaryPerSDR + AvgYearlyCommissionsPerSDR) * (PayrollTaxRate / 100);
      const benefitsCostPerSDR = YearlySalaryPerSDR * (BenefitsRate / 100);
      const MonthlyInfrastructureAndFacilitiesCostPerSDR = (YearlySalaryPerSDR * SDRsSeekingToHire + SDRManagementCost) / SDRsSeekingToHire * 0.1 / 12;
  
      // Calculate manager cost allocation
      const managerCostAllocation = (SDRManagementCost / SDRsSeekingToHire);
  
      // Calculate total yearly direct cost per SDR
      const yearlyDirectCostPerSDR = YearlySalaryPerSDR + AvgYearlyCommissionsPerSDR +
        payrollTaxPerSDR + benefitsCostPerSDR + managerCostAllocation;
  
      // Monthly direct cost per SDR
      const monthlyDirectCostPerSDR = yearlyDirectCostPerSDR / 12;
  
      const totalMonthlyInHouse = MonthlyInfrastructureAndFacilitiesCostPerSDR + managerCostAllocation / 12
        + (OnboardingAndTrainingCostPerSDR * MonthlyTurnoverRate / 100) + (RecruitmentCostPerSDR * MonthlyTurnoverRate / 100)
        + MonthlyLicensesAndSalesToolsCostPerSDR + benefitsCostPerSDR / 12 + payrollTaxPerSDR / 12 + AvgYearlyCommissionsPerSDR / 12
        + YearlySalaryPerSDR / 12;
  
      return {
        payrollTaxPerSDR,
        benefitsCostPerSDR,
        MonthlyInfrastructureAndFacilitiesCostPerSDR,
        managerCostAllocation,
        yearlyDirectCostPerSDR,
        monthlyDirectCostPerSDR,
        totalMonthlyInHouse,
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
        if (value < 0) {
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
        SDRManagementCost: 137000,
        SDRsSeekingToHire: 7,
        BenefitsRate: 20,
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