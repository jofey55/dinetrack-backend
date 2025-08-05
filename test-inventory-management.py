#!/usr/bin/env python3
"""
Comprehensive Test Suite for Zawadi Inventory Tracker
Tests all key features including measurement units, price tracking, and data validation
"""

import requests
import json
import time
from typing import Dict, Any, List

class InventoryTestSuite:
    def __init__(self, base_url: str = "http://localhost:5000"):
        self.base_url = base_url
        self.test_results = []
        
    def log_test(self, test_name: str, passed: bool, details: str = ""):
        """Log test results"""
        status = "✅ PASS" if passed else "❌ FAIL"
        self.test_results.append({
            "test": test_name,
            "passed": passed,
            "details": details
        })
        print(f"{status}: {test_name}")
        if details:
            print(f"   Details: {details}")
    
    def test_add_item_with_measurement(self):
        """Test #1: Add item with measurement unit"""
        test_data = {
            "name": "Test Sugar",
            "currentQuantity": "5",
            "minimumLevel": "2",
            "unit": "lbs",
            "storageAreaId": "dry-storage",
            "categoryId": "dry-ingredients"
        }
        
        try:
            response = requests.post(f"{self.base_url}/api/inventory-items", json=test_data)
            passed = response.status_code == 201
            details = f"Status: {response.status_code}, Response: {response.text[:100]}"
            self.log_test("Add item with measurement (5 lbs Sugar)", passed, details)
            return response.json() if passed else None
        except Exception as e:
            self.log_test("Add item with measurement (5 lbs Sugar)", False, str(e))
            return None
    
    def test_add_item_with_custom_unit(self):
        """Test #2: Add item with custom unit"""
        test_data = {
            "name": "Test Juice",
            "currentQuantity": "2",
            "minimumLevel": "1",
            "unit": "gallons",
            "storageAreaId": "cold-storage",
            "categoryId": "sauces-condiments"
        }
        
        try:
            response = requests.post(f"{self.base_url}/api/inventory-items", json=test_data)
            passed = response.status_code == 201
            details = f"Status: {response.status_code}, Custom unit 'gallons' accepted"
            self.log_test("Add item with custom unit (2 gallons Juice)", passed, details)
            return response.json() if passed else None
        except Exception as e:
            self.log_test("Add item with custom unit (2 gallons Juice)", False, str(e))
            return None
    
    def test_add_item_without_unit(self):
        """Test #3: Add item without unit (should fail)"""
        test_data = {
            "name": "Test Eggs",
            "currentQuantity": "12",
            "minimumLevel": "6",
            "storageAreaId": "cold-storage",
            "categoryId": "dairy-products"
            # Missing 'unit' field
        }
        
        try:
            response = requests.post(f"{self.base_url}/api/inventory-items", json=test_data)
            passed = response.status_code == 400  # Should fail validation
            details = f"Status: {response.status_code}, Correctly rejected missing unit"
            self.log_test("Add item without unit (should fail)", passed, details)
        except Exception as e:
            self.log_test("Add item without unit (should fail)", False, str(e))
    
    def test_add_item_with_price(self):
        """Test #4: Add item with unit and price"""
        test_data = {
            "name": "Test Rice",
            "currentQuantity": "10",
            "minimumLevel": "5",
            "unit": "lbs",
            "pricePerUnit": "1.20",
            "storageAreaId": "dry-storage",
            "categoryId": "dry-ingredients"
        }
        
        try:
            response = requests.post(f"{self.base_url}/api/inventory-items", json=test_data)
            passed = response.status_code == 201
            if passed:
                item_data = response.json()
                price_stored = float(item_data.get('pricePerUnit', 0)) == 1.20
                passed = passed and price_stored
            details = f"Status: {response.status_code}, Price stored correctly: ${test_data['pricePerUnit']}/lb"
            self.log_test("Add item with unit and price (10 lbs Rice @ $1.20/lb)", passed, details)
            return response.json() if passed else None
        except Exception as e:
            self.log_test("Add item with unit and price (10 lbs Rice @ $1.20/lb)", False, str(e))
            return None
    
    def test_add_item_with_kg_unit(self):
        """Test #5: Add item with special unit (kg)"""
        test_data = {
            "name": "Test Flour",
            "currentQuantity": "25",
            "minimumLevel": "10",
            "unit": "kg",
            "storageAreaId": "dry-storage",
            "categoryId": "dry-ingredients"
        }
        
        try:
            response = requests.post(f"{self.base_url}/api/inventory-items", json=test_data)
            passed = response.status_code == 201
            details = f"Status: {response.status_code}, Metric unit 'kg' accepted"
            self.log_test("Add item with special unit (25 kg Flour)", passed, details)
            return response.json() if passed else None
        except Exception as e:
            self.log_test("Add item with special unit (25 kg Flour)", False, str(e))
            return None
    
    def test_barcode_search(self):
        """Test barcode search functionality"""
        test_barcodes = ["123456789012", "987654321098", "555666777888"]
        
        for i, barcode in enumerate(test_barcodes):
            try:
                response = requests.get(f"{self.base_url}/api/inventory-items/search?barcode={barcode}")
                passed = response.status_code == 200
                if passed:
                    items = response.json()
                    passed = len(items) > 0 and items[0].get('barcode') == barcode
                details = f"Barcode {barcode} found: {len(response.json()) if passed else 0} items"
                self.log_test(f"Barcode search #{i+1} ({barcode})", passed, details)
            except Exception as e:
                self.log_test(f"Barcode search #{i+1} ({barcode})", False, str(e))
    
    def test_unit_validation(self):
        """Test unit validation with various inputs"""
        valid_units = ["lbs", "kg", "pcs", "bags", "gallons", "liters", "cans", "boxes"]
        
        for i, unit in enumerate(valid_units):
            test_data = {
                "name": f"Test Item {unit}",
                "currentQuantity": "1",
                "minimumLevel": "1",
                "unit": unit,
                "storageAreaId": "dry-storage",
                "categoryId": "dry-ingredients"
            }
            
            try:
                response = requests.post(f"{self.base_url}/api/inventory-items", json=test_data)
                passed = response.status_code == 201
                details = f"Unit '{unit}' accepted"
                self.log_test(f"Unit validation: {unit}", passed, details)
                
                # Clean up test item
                if passed:
                    item_id = response.json().get('id')
                    if item_id:
                        requests.delete(f"{self.base_url}/api/inventory-items/{item_id}")
            except Exception as e:
                self.log_test(f"Unit validation: {unit}", False, str(e))
    
    def test_dashboard_stats(self):
        """Test dashboard statistics API"""
        try:
            response = requests.get(f"{self.base_url}/api/dashboard/stats")
            passed = response.status_code == 200
            if passed:
                stats = response.json()
                required_fields = ['totalItems', 'lowStockItems', 'totalCategories', 'totalStorageAreas']
                passed = all(field in stats for field in required_fields)
            details = f"Dashboard stats loaded with all required fields"
            self.log_test("Dashboard statistics", passed, details)
        except Exception as e:
            self.log_test("Dashboard statistics", False, str(e))
    
    def test_storage_areas_with_stats(self):
        """Test storage areas with statistics"""
        try:
            response = requests.get(f"{self.base_url}/api/storage-areas/with-stats")
            passed = response.status_code == 200
            if passed:
                areas = response.json()
                passed = len(areas) >= 3  # Should have dry-storage, cold-storage, freezer
                area_names = [area.get('name', '') for area in areas]
                passed = passed and 'Dry Storage' in area_names
            details = f"Found {len(response.json()) if passed else 0} storage areas"
            self.log_test("Storage areas with stats", passed, details)
        except Exception as e:
            self.log_test("Storage areas with stats", False, str(e))
    
    def run_all_tests(self):
        """Run the complete test suite"""
        print("🧪 Starting Zawadi Inventory Tracker Test Suite")
        print("=" * 60)
        
        # Basic functionality tests
        self.test_add_item_with_measurement()
        self.test_add_item_with_custom_unit() 
        self.test_add_item_without_unit()
        self.test_add_item_with_price()
        self.test_add_item_with_kg_unit()
        
        # Advanced feature tests
        self.test_barcode_search()
        self.test_unit_validation()
        self.test_dashboard_stats()
        self.test_storage_areas_with_stats()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST RESULTS SUMMARY")
        print("=" * 60)
        
        passed_tests = sum(1 for result in self.test_results if result['passed'])
        total_tests = len(self.test_results)
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests}")
        print(f"Failed: {total_tests - passed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests*100):.1f}%")
        
        print("\n🔍 DETAILED RESULTS:")
        for result in self.test_results:
            status = "✅" if result['passed'] else "❌"
            print(f"{status} {result['test']}")
            if result['details'] and not result['passed']:
                print(f"    ⚠️  {result['details']}")
        
        return passed_tests, total_tests

if __name__ == "__main__":
    # Wait for server to be ready
    print("⏳ Waiting for server to be ready...")
    time.sleep(2)
    
    # Run tests
    test_suite = InventoryTestSuite()
    passed, total = test_suite.run_all_tests()
    
    # Exit with appropriate code
    exit(0 if passed == total else 1)