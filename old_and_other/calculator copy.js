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
    City: '' // Added city field
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

  // City-state mapping for autofill functionality
  const popularCities = [
    { city: "New York", state: "NY" },
    { city: "Los Angeles", state: "CA" },
    { city: "Chicago", state: "IL" },
    { city: "Houston", state: "TX" },
    { city: "Phoenix", state: "AZ" },
    { city: "Philadelphia", state: "PA" },
    { city: "San Antonio", state: "TX" },
    { city: "San Diego", state: "CA" },
    { city: "Dallas", state: "TX" },
    { city: "San Jose", state: "CA" },
    { city: "Austin", state: "TX" },
    { city: "Jacksonville", state: "FL" },
    { city: "Fort Worth", state: "TX" },
    { city: "Columbus", state: "OH" },
    { city: "San Francisco", state: "CA" },
    { city: "Charlotte", state: "NC" },
    { city: "Indianapolis", state: "IN" },
    { city: "Seattle", state: "WA" },
    { city: "Denver", state: "CO" },
    { city: "Washington", state: "DC" },
    { city: "Boston", state: "MA" },
    { city: "Nashville", state: "TN" },
    { city: "Baltimore", state: "MD" },
    { city: "Oklahoma City", state: "OK" },
    { city: "Louisville", state: "KY" },
    { city: "Portland", state: "OR" },
    { city: "Las Vegas", state: "NV" },
    { city: "Milwaukee", state: "WI" },
    { city: "Albuquerque", state: "NM" },
    { city: "Tucson", state: "AZ" },
    { city: "Fresno", state: "CA" },
    { city: "Sacramento", state: "CA" },
    { city: "Atlanta", state: "GA" },
    { city: "Kansas City", state: "MO" },
    { city: "Miami", state: "FL" },
    { city: "Raleigh", state: "NC" },
    { city: "Omaha", state: "NE" },
    { city: "Minneapolis", state: "MN" },
    { city: "Cleveland", state: "OH" },
    { city: "Pittsburgh", state: "PA" },
    { city: "Detroit", state: "MI" },
    { city: "St. Louis", state: "MO" }
  ];

  // Fetch currency rates on page load
  fetchCurrencyRates();

  // Cache form elements
  const form = document.getElementById('calculator-form');
  const currencySelect = document.getElementById('Currency');
  const resetButton = document.getElementById('reset-button');
  const calculateButton = document.getElementById('calculate-button');
  const stateSelect = document.getElementById('State');
  const cityInput = document.getElementById('City');

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

  if (cityInput) {
    // Setup autocomplete for city input
    setupCityAutocomplete(cityInput);
    
    // Handle blur event for city input (when user clicks away)
    cityInput.addEventListener('blur', function() {
      const selectedCity = cityInput.value.trim();
      if (selectedCity) {
        handleCitySelection(selectedCity);
      }
    });
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
   * Sets up autocomplete functionality for city input
   * @param {HTMLElement} input - The city input element
   */
  function setupCityAutocomplete(input) {
    // Create a container for the autocomplete items
    const autocompleteContainer = document.createElement('div');
    autocompleteContainer.className = 'autocomplete-items';
    autocompleteContainer.style.display = 'none';
    autocompleteContainer.style.position = 'absolute';
    autocompleteContainer.style.zIndex = '99';
    autocompleteContainer.style.maxHeight = '200px';
    autocompleteContainer.style.overflowY = 'auto';
    autocompleteContainer.style.border = '1px solid #ddd';
    autocompleteContainer.style.backgroundColor = '#fff';
    autocompleteContainer.style.width = input.offsetWidth + 'px';
    
    // Insert the container after the input
    input.parentNode.insertBefore(autocompleteContainer, input.nextSibling);
    
    // Add event listener for input on the city field
    input.addEventListener('input', function() {
      const value = this.value.trim();
      
      // Close any existing autocomplete lists
      autocompleteContainer.innerHTML = '';
      
      if (!value) {
        autocompleteContainer.style.display = 'none';
        return;
      }
      
      // Filter cities based on input
      const matchingCities = popularCities.filter(item => 
        item.city.toLowerCase().startsWith(value.toLowerCase())
      );
      
      if (matchingCities.length > 0) {
        autocompleteContainer.style.display = 'block';
        
        // Create a div for each matching city
        matchingCities.forEach(item => {
          const itemDiv = document.createElement('div');
          itemDiv.innerHTML = `<strong>${item.city}</strong>, ${item.state}`;
          itemDiv.style.padding = '10px';
          itemDiv.style.cursor = 'pointer';
          itemDiv.style.borderBottom = '1px solid #ddd';
          
          // Add hover effect
          itemDiv.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#e9e9e9';
          });
          
          itemDiv.addEventListener('mouseleave', function() {
            this.style.backgroundColor = '#fff';
          });
          
          // Add click event
          itemDiv.addEventListener('click', function() {
            input.value = item.city;
            autocompleteContainer.style.display = 'none';
            
            // Handle the city selection
            handleCitySelection(item.city, item.state);
          });
          
          autocompleteContainer.appendChild(itemDiv);
        });
      } else {
        autocompleteContainer.style.display = 'none';
      }
    });
    
    // Close the autocomplete list when clicking outside
    document.addEventListener('click', function(e) {
      if (e.target !== input) {
        autocompleteContainer.style.display = 'none';
      }
    });
  }

  /**
   * Handles city selection from autocomplete
   * @param {string} city - The selected city
   * @param {string} state - The state code (optional)
   */
  function handleCitySelection(place) {
    // Update city in form data
    let city = place.split(",")[0];
    let state = place.split(",")[1];
    formData.City = city;
    console.log(city)
    console.log(state)
    // If state is provided directly, use it
    if (state) {
      console.log(state)
      formData.State = state;
      updateTaxRateForState(state);
      fetchSalaryForLocation(city, state);
      return;
    }
    
    // Otherwise, try to find the state from our popular cities list
    const cityData = popularCities.find(item => 
      item.city.toLowerCase() === city.toLowerCase()
    );
    
    if (cityData) {
      // We found the city in our list
      formData.State = cityData.state;
      updateTaxRateForState(cityData.state);
      fetchSalaryForLocation(city, cityData.state);
    } else {
      // City not found in our list, prompt user to select a state
      console.log('City not found in our database. Please select a state.');
      // You could show a notification to the user here
    }
  }

  /**
   * Handle state change in dropdown
   * @param {Event} e - The state change event
   */
  function handleStateChange(e) {
    const stateCode = e.target.value;
    formData.State = stateCode;
    updateTaxRateForState(stateCode);
    
    // If we have a city, fetch salary data
    if (formData.City) {
      fetchSalaryForLocation(formData.City, stateCode);
    }
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
    // Special handling for City field which is a string
    if (name === 'City') {
      formData[name] = value;
    } else {
      // Convert input to number and ensure it's valid
      const numericValue = parseFloat(value) || 0;
      formData[name] = numericValue;
    }

    // Clear error for this field
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
   * Fetches salary data for a specific city and state
   * @param {string} city - The city name
   * @param {string} state - The state code
   */
  async function fetchSalaryForLocation(city, state) {
    if (!city || !state) return;
    
    displayLoading('YearlySalaryPerSDR');
    
    try {
      // Fetch salary from Google Search API
      const salary = await fetchSDRSalaryFromGoogle(city, state);
      
      // If we got a valid salary, update the form
      if (salary) {
        const salaryInput = document.getElementById('YearlySalaryPerSDR');
        if (salaryInput) {
          salaryInput.value = salary;
          formData.YearlySalaryPerSDR = salary;
        }
      } else {
        const estimatedSalary = 65000;
        
        const salaryInput = document.getElementById('YearlySalaryPerSDR');
        if (salaryInput) {
          salaryInput.value = estimatedSalary;
          formData.YearlySalaryPerSDR = estimatedSalary;
        }
      }
    } catch (error) {
      console.error('Error fetching salary data:', error);
    } finally {
      // Remove loading state from salary field
      removeLoading('YearlySalaryPerSDR', formData.YearlySalaryPerSDR);
    }
  }

  /**
   * Uses Google Search API to find average SDR salary in a specific city and state
   * @param {string} city - The city name
   * @param {string} state - The state code
   * @returns {Promise<number>} The average yearly salary
   */
  async function fetchSDRSalaryFromGoogle(city, state) {
    if (!city || !state) {
      return Promise.reject('City and state are required');
    }

    const apiKey = 'AIzaSyDviwjbYNN83RFcPBh7B0KoupXKcZjtO8g';
    const searchEngineId = 'c244f79be99fa4213'; 
    const query = encodeURIComponent(`what is the average sdr salary in ${city}, ${state} exact figure glassdoor`);
    
    try {
      const response = await fetch(
        `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${query}`
      );
      console.log("response", response);
      const data = await response.json();
      console.log("data", data)
      if (!data.items || data.items.length === 0) {
        console.log('No search results found');
        return null;
      }
      
      // Try to extract salary from the snippet or title of the first few results
      for (let i = 0; i < Math.min(3, data.items.length); i++) {
        const item = data.items[i];
        const text = item.snippet + ' ' + item.title;
        
        // Look for salary patterns like "$60,000" or "60,000 dollars" or "average salary of $60,000"
        const salaryRegex = /(?:average|avg|median)?\s*(?:salary|pay|compensation)?\s*(?:of)?\s*\$?(\d{1,3}(?:,\d{3})*)/i;
        const match = text.match(salaryRegex);
        
        if (match && match[1]) {
          // Convert the matched salary string to a number
          const salary = parseInt(match[1].replace(/,/g, ''), 10);
          if (!isNaN(salary) && salary > 20000 && salary < 200000) { // Sanity check
            console.log(`Found salary: ${salary} from result: ${text}`);
            return salary;
          }
        }
      }
      
      console.log('Could not extract salary from search results');
      return null;
    } catch (error) {
      console.error('Error fetching salary data from Google:', error);
      return null;
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
      if (key !== 'City' && key !== 'State' && value < 0) {
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
   * Display loading state for a field
   * @param {string} fieldName - The name of the field to show loading state
   */
  function displayLoading(fieldName) {
    const inputElement = document.getElementById(fieldName);
    if (inputElement) {
      inputElement.value = 'Loading...';
      inputElement.disabled = true;
    }
  }

  /**
   * Remove loading state for a field
   * @param {string} fieldName - The name of the field to remove loading state
   * @param {any} value - The value to set
   */
  function removeLoading(fieldName, value) {
    const inputElement = document.getElementById(fieldName);
    if (inputElement) {
      inputElement.value = value;
      inputElement.disabled = false;
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