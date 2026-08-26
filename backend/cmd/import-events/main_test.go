package main

import "testing"

func TestValuesFor(t *testing.T) {
	header := append([]string{}, columns...)
	indexes := map[string]int{}
	for index, name := range header {
		indexes[name] = index
	}
	row := []string{
		"5348307811", "2514580", "561", "862", "2024/2025", "2025-03-08 20:00:00",
		"1803", "54728", "Idrissa Gueye", "1659", "124", "2", "10266.6281",
		"PASS", "", "SUCCESS", "25.3", "20.8", "1.8", "10", "", "314406",
		"Vitaliy Mykolenko",
	}
	values, err := valuesFor(row, indexes)
	if err != nil {
		t.Fatal(err)
	}
	if values[0] != int64(5348307811) || values[12] != 10266.6281 || values[20] != nil {
		t.Fatalf("unexpected parsed values: %#v", values)
	}
}
