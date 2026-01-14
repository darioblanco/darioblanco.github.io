.PHONY: serve clean

PORT ?= 8000

serve:
	@echo "Starting local server at http://localhost:$(PORT)"
	@python3 -m http.server $(PORT)

clean:
	@find . -name '.DS_Store' -delete
	@echo "Cleaned up temporary files"
