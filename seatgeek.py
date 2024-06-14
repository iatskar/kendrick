from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import random
import time

# Setup Chrome options
chrome_options = Options()
chrome_options.add_argument("--disable-blink-features=AutomationControlled")
chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument("--window-size=1920,1080")
chrome_options.add_argument("--start-maximized")

# Set the path to the chromedriver executable
chrome_service = Service('/usr/local/bin/chromedriver')  # Replace with your actual path to chromedriver

# Initialize the WebDriver
try:
    driver = webdriver.Chrome(service=chrome_service, options=chrome_options)
    print("ChromeDriver started successfully.")
except Exception as e:
    print(f"Error initializing Chrome WebDriver: {e}")
    exit(1)

# Add some stealth options
driver.execute_cdp_cmd('Page.addScriptToEvaluateOnNewDocument', {
    'source': '''
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    '''
})

# Function to introduce random delays and mimic human-like behavior
def human_delay(min_time=1.5, max_time=3.5):
    time.sleep(random.uniform(min_time, max_time))

# Function to simulate realistic mouse movement
def simulate_mouse_movement(driver, element):
    action = webdriver.ActionChains(driver)
    action.move_to_element_with_offset(element, random.randint(-5, 5), random.randint(-5, 5)).perform()
    human_delay(0.5, 1.5)

# URL of the SeatGeek page
url = "https://seatgeek.com/kendrick-lamar-tickets/inglewood-california-kia-forum-2024-06-19-4-pm/concert/16916755"

# Open the URL
driver.get(url)

# Wait for manual CAPTCHA solving
input("Please solve the initial CAPTCHA and press Enter to continue...")

# Introduce a delay to simulate user reading or viewing the page
human_delay(5, 10)

# Step 1: Open the "Sort by" dropdown menu
try:
    sort_button = WebDriverWait(driver, 30).until(
        EC.element_to_be_clickable((By.CSS_SELECTOR, 'button.SortButton__SortHeading-sc-9222f06-0'))
    )
    simulate_mouse_movement(driver, sort_button)
    sort_button.click()
    print("Sort by dropdown opened.")
    human_delay()  # Wait after clicking
except Exception as e:
    print(f"Error opening the Sort by dropdown: {e}")
    driver.quit()

# Step 2: Select the correct "Price" option from the dropdown
try:
    # Wait for the dropdown options to be visible
    dropdown_options = WebDriverWait(driver, 30).until(
        EC.visibility_of_element_located((By.CSS_SELECTOR, 'div.Options-sc-6f2435fa-0'))
    )

    # Print the HTML to debug and ensure options are loaded
    print("Dropdown options HTML:")
    print(dropdown_options.get_attribute('innerHTML'))

    # Locate the correct "Price" option within the dropdown
    price_option = WebDriverWait(driver, 30).until(
        EC.element_to_be_clickable((By.XPATH, "//div[@class='Options__OptionsOverflow-sc-6f2435fa-1 bXhIFC sg-dropdown__options-scroll']//button[.//span[text()='Price']]"))
    )

    # Scroll into view to ensure it's visible and clickable
    driver.execute_script("arguments[0].scrollIntoView(true);", price_option)

    # Attempt to click the "Price" option using JavaScript if direct click fails
    try:
        simulate_mouse_movement(driver, price_option)
        price_option.click()
        print("Price option clicked directly.")
    except Exception as e:
        print(f"Direct click failed: {e}. Attempting JavaScript click.")
        driver.execute_script("arguments[0].click();", price_option)
        print("Price option clicked via JavaScript.")

    # Wait for the sorting to complete and the new sorted list to be loaded
    human_delay(10, 15)  # Increase wait time to ensure page reloads and sorts
except Exception as e:
    print(f"Error selecting the correct 'Price' option: {e}")
    driver.quit()

# Step 3: Scrape the first 5 prices from the sorted results
try:
    # Wait for the price elements to be present after sorting
    price_elements = WebDriverWait(driver, 30).until(
        EC.presence_of_all_elements_located((By.CSS_SELECTOR, 'span.atm_7l_1vdhuoi.atm_c8_1ns2gi5'))
    )
    prices = []
    for element in price_elements[:5]:  # Get the first 5 prices
        price_text = element.text
        # Remove non-numeric characters and convert to integer
        price_value = ''.join(filter(str.isdigit, price_text))
        if price_value:
            prices.append(int(price_value))
    
    # Print the first 5 found prices
    if prices:
        print(f"First 5 prices: {prices}")
    else:
        print("No prices found.")
except Exception as e:
    print(f"Error retrieving prices: {e}")

# Close the browser
driver.quit()