import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import * as Fuse from 'fuse.js';
import { ControlStorageKeys } from 'app/models/control';

export class FuzzySearchOptions {
  caseSensitive?: boolean;
  shouldSort: true;
  tokenize?: boolean;
  matchAllTokens?: boolean;
  findAllMatches?: boolean;
  includeScore?: boolean;
  includeMatches?: boolean;
  threshold = 0.3;
  location = 0;
  distance = 100;
  maxPatternLength = 32;
  minMatchCharLength = 3;
  keys: string[] = [];

  constructor(obj?: FuzzySearchOptions, data?: object[]) {
    if (obj) {
      Object.assign(this, obj);
    } else {
      this.setKeys(null, data);
    }
  }
  setKeys(keys?: string[], data?: object[]) {
    this.keys = keys || this.getDefaultKeys(data);
  }

  getDefaultKeys(data: object[]) {
    // just get ALL main level keys from the first object as search params if none provided
    if (data.length) {
      return Object.keys(data[0]);
    }
    return [];
  }
}

@Component({
  selector: 'mds-fuzzy-search',
  templateUrl: './fuzzy-search.component.html',
  styleUrls: ['./fuzzy-search.component.css']
})
export class FuzzySearchComponent implements OnChanges {
  @Input() data: object[];
  @Input() keys: string[];
  @Input() disabled = false;
  @Input() placeholder = 'Filter Results';
  @Output() results = new EventEmitter();

  private searchEngine;
  private searchOptions: FuzzySearchOptions;

  debounceTimer;
  debounceWait = 100;

  count: number;
  color: string;
  isValid: boolean;
  total: number;

  constructor() {}

  ngOnChanges() {
    if (this.data && this.data.length && this.keys.length) {
      this.updateCount(this.data.length);
      this.searchOptions = new FuzzySearchOptions(null, this.data);
      this.searchOptions.setKeys(this.keys);
      this.searchEngine = new Fuse(this.data, this.searchOptions);
      console.log('search engine ready');
    }
  }

  setOptions(options?: FuzzySearchOptions) {
    this.searchOptions = new FuzzySearchOptions(options, this.data);
  }

  searchForTerm(term) {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    this.debounceTimer = setTimeout(() => {
      const matches = this.searchEngine.search(term);
      this.updateCount(term ? matches.length : this.data.length);
      this.results.emit([matches, term]);
    }, this.debounceWait);
  }

  updateCount(newCount?: number) {
    this.count = newCount;
    this.total = this.data.length;
    this.color = newCount > 0 ? 'black' : 'red';
    this.isValid = newCount > 0;

    if (!this.isValid) {
      this.placeholder = 'No Results Found';
    } else {
      this.placeholder = 'Filter Results';
    }
  }

  clear(elem) {
    this.updateCount(this.data.length);
    this.results.emit([]);
    elem.value = '';
  }
}
