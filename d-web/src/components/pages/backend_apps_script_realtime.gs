const CONFIG = {
  SPREADSHEET_ID: '1Jc6DImFcqbaJlXpmB1Df7PiAM5xGCQ9gR8NTqaalJtc',
  SHEET_NAME: '', // kosongkan agar ambil sheet pertama, atau isi nama sheet mis. 'Produksi'
  TIMEZONE: 'Asia/Jakarta',
  DUMMY_STATE_KEY: 'PRODUCTION_DUMMY_STATE_V2',
  DEFAULT_HEADERS: [
    'tanggal',
    'line',
    'shift',
    'target_pcs',
    'good_pcs',
    'reject_pcs',
    'total_pcs',
    'loading_time_min',
    'trouble_time_min',
    'ideal_cycle_time_sec',
    'updated_at',
    'source'
  ],
  DEFAULT_DUMMY_STATE: {
    running: false,
    line: 'Line A',
    shift: '1',
    target_pcs: 1000,
    loading_time_min: 480,
    trouble_time_max_min: 30,
    ideal_cycle_time_sec: 24,
    interval_sec: 5,
    sequence: 0,
    last_generated_at: '',
    last_written_row: 0
  }
};

const FIELD_ALIASES = {
  tanggal: ['tanggal', 'date', 'datetime', 'waktu', 'timestamp', 'jam'],
  line: ['line', 'mesin', 'machine', 'station', 'workcenter', 'cell'],
  shift: ['shift', 'grup', 'group'],
  target_pcs: ['target_pcs', 'target', 'plan_target', 'target produksi', 'target produksi pcs'],
  good_pcs: ['good_pcs', 'ok_pcs', 'good', 'actual_good', 'hasil_bagus', 'pcs_bagus', 'produksi_bagus'],
  reject_pcs: ['reject_pcs', 'reject', 'ng', 'defect', 'scrap', 'pcs_reject', 'produksi_reject'],
  total_pcs: ['total_pcs', 'total produksi', 'total_produksi', 'output', 'actual_output'],
  loading_time_min: ['loading_time', 'loading_time_min', 'planned_time', 'planned production time', 'waktu_loading', 'waktu loading', 'available_time', 'run_schedule_min'],
  trouble_time_min: ['time_trouble', 'trouble_time', 'downtime', 'downtime_min', 'breakdown_time', 'waktu_trouble', 'waktu trouble', 'lost_time'],
  ideal_cycle_time_sec: ['ideal_cycle_time', 'ideal_cycle_time_sec', 'cycle_time', 'cycle_time_sec', 'std_cycle_time', 'standard_cycle_time'],
  updated_at: ['updated_at', 'last_update', 'updated', 'last updated'],
  source: ['source', 'data_source', 'mode', 'keterangan']
};

function doGet(e) {
  return jsonResponse(output(e));
}

function doPost(e) {
  return jsonResponse(output(e));
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function output(e) {
  const params = getRequestParams(e);
  const type = String(params.type || params.action || 'dashboard').toLowerCase();

  try {
    switch (type) {
      case '1':
      case 'dashboard':
        return buildDashboardResponse(params);

      case 'summary':
        return {
          success: true,
          summary: aggregateRecords(getProductionRecords(params)),
          dummy: getDummyState()
        };

      case 'records':
        return {
          success: true,
          records: getProductionRecords(params),
          dummy: getDummyState()
        };

      case 'raw':
        return {
          success: true,
          vals: getRawSheetValues(),
          dummy: getDummyState()
        };

      case 'dummy_status':
        return {
          success: true,
          dummy: getDummyState()
        };

      case 'dummy_start':
        return startDummy(params);

      case 'dummy_stop':
        return stopDummy();

      case 'dummy_tick':
        return runDummyTick(params);

      case 'append_record':
        return appendManualRecord(params);

      case '3':
      case 'debug':
        return {
          success: true,
          vals: sanitizeEvent(e),
          parsed_params: params
        };

      default:
        return {
          success: false,
          message: 'Parameter type/action tidak dikenali.',
          available: ['dashboard', 'summary', 'records', 'raw', 'dummy_status', 'dummy_start', 'dummy_stop', 'dummy_tick', 'append_record', 'debug']
        };
    }
  } catch (error) {
    return {
      success: false,
      message: error.message,
      stack: error.stack ? String(error.stack).split('\n') : []
    };
  }
}

function getRequestParams(e) {
  const queryParams = (e && e.parameter) ? e.parameter : {};
  const body = {};

  if (e && e.postData && e.postData.contents) {
    const raw = String(e.postData.contents || '').trim();
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          Object.keys(parsed).forEach(function (key) {
            body[key] = parsed[key];
          });
        }
      } catch (parseError) {
        // Abaikan body non-JSON. Query parameter tetap dipakai.
      }
    }
  }

  return mergeObjects(queryParams, body);
}

function buildDashboardResponse(params) {
  const records = getProductionRecords(params);
  const summary = aggregateRecords(records);
  const byLine = groupAndAggregate(records, 'line');
  const byDate = groupAndAggregate(records, 'date_key');
  const byShift = groupAndAggregate(records, 'shift');

  return {
    success: true,
    generated_at: formatDateTime(new Date()),
    meta: {
      total_rows: records.length,
      spreadsheet_id: CONFIG.SPREADSHEET_ID,
      sheet_name: getSheet().getName(),
      filters: {
        line: params.line || '',
        shift: params.shift || '',
        startDate: params.startDate || '',
        endDate: params.endDate || ''
      }
    },
    dummy: getDummyState(),
    summary: summary,
    records: records,
    breakdown: {
      by_line: byLine,
      by_date: byDate,
      by_shift: byShift
    }
  };
}

function getRawSheetValues() {
  return getSheet().getDataRange().getValues();
}

function getSheet() {
  const ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  return CONFIG.SHEET_NAME ? ss.getSheetByName(CONFIG.SHEET_NAME) : ss.getSheets()[0];
}

function ensureSheetHeaders(sheet) {
  const safeSheet = sheet || getSheet();
  const lastRow = safeSheet.getLastRow();
  const lastColumn = safeSheet.getLastColumn();

  if (lastRow === 0 || lastColumn === 0) {
    safeSheet.getRange(1, 1, 1, CONFIG.DEFAULT_HEADERS.length).setValues([CONFIG.DEFAULT_HEADERS]);
    return CONFIG.DEFAULT_HEADERS.slice();
  }

  const headers = safeSheet.getRange(1, 1, 1, lastColumn).getValues()[0].map(function (item) {
    return String(item || '').trim();
  });

  const hasHeaders = headers.some(function (item) {
    return item !== '';
  });

  if (!hasHeaders) {
    safeSheet.getRange(1, 1, 1, CONFIG.DEFAULT_HEADERS.length).setValues([CONFIG.DEFAULT_HEADERS]);
    return CONFIG.DEFAULT_HEADERS.slice();
  }

  return headers;
}

function getProductionRecords(params) {
  const sheet = getSheet();
  const values = sheet.getDataRange().getValues();

  if (!values || values.length < 2) return [];

  const headers = values[0];
  const rows = values.slice(1);

  const records = rows
    .map(function (row, index) {
      return rowToObject(headers, row, index + 2);
    })
    .filter(function (row) {
      return !isRowEmpty(row);
    })
    .map(normalizeRecord);

  return applyRecordFilters(records, params || {});
}

function rowToObject(headers, row, rowNumber) {
  const obj = { _rowNumber: rowNumber };

  headers.forEach(function (header, index) {
    const key = String(header || '').trim();
    obj[key] = row[index];
  });

  return obj;
}

function isRowEmpty(row) {
  const keys = Object.keys(row);
  return keys.every(function (key) {
    if (key === '_rowNumber') return true;
    const value = row[key];
    return value === '' || value === null || typeof value === 'undefined';
  });
}

function normalizeRecord(row) {
  const dateValue = pickValue(row, FIELD_ALIASES.tanggal);

  const line = String(pickValue(row, FIELD_ALIASES.line) || 'Unknown').trim();
  const shift = String(pickValue(row, FIELD_ALIASES.shift) || '-').trim();
  const targetPcs = toNumber(pickValue(row, FIELD_ALIASES.target_pcs));
  const goodPcs = toNumber(pickValue(row, FIELD_ALIASES.good_pcs));
  const rejectPcs = toNumber(pickValue(row, FIELD_ALIASES.reject_pcs));

  const totalPcs = toNumber(pickValue(row, FIELD_ALIASES.total_pcs)) || (goodPcs + rejectPcs);
  const loadingTimeMin = toNumber(pickValue(row, FIELD_ALIASES.loading_time_min));
  const troubleTimeMin = toNumber(pickValue(row, FIELD_ALIASES.trouble_time_min));
  const idealCycleTimeSec = toNumber(pickValue(row, FIELD_ALIASES.ideal_cycle_time_sec));

  const operatingTimeMin = Math.max(loadingTimeMin - troubleTimeMin, 0);
  const actualCycleTimeSec = (operatingTimeMin > 0 && totalPcs > 0)
    ? (operatingTimeMin * 60) / totalPcs
    : 0;

  const availability = loadingTimeMin > 0 ? operatingTimeMin / loadingTimeMin : 0;
  const performanceRaw = (operatingTimeMin > 0 && idealCycleTimeSec > 0 && totalPcs > 0)
    ? (idealCycleTimeSec * totalPcs) / (operatingTimeMin * 60)
    : 0;
  const performance = clamp(performanceRaw, 0, 1);
  const quality = totalPcs > 0 ? goodPcs / totalPcs : 0;
  const oee = availability * performance * quality;

  return {
    row_number: row._rowNumber,
    raw_date: normalizeDateValue(dateValue),
    date_key: formatDateKey(dateValue),
    date_label: formatDateLabel(dateValue),
    line: line,
    shift: shift,
    target_pcs: targetPcs,
    good_pcs: goodPcs,
    reject_pcs: rejectPcs,
    total_pcs: totalPcs,
    loading_time_min: loadingTimeMin,
    trouble_time_min: troubleTimeMin,
    operating_time_min: operatingTimeMin,
    ideal_cycle_time_sec: idealCycleTimeSec,
    actual_cycle_time_sec: round2(actualCycleTimeSec),
    availability: round4(availability),
    performance: round4(performance),
    performance_raw: round4(performanceRaw),
    quality: round4(quality),
    oee: round4(oee),
    target_achievement: targetPcs > 0 ? round4(totalPcs / targetPcs) : 0
  };
}

function applyRecordFilters(records, params) {
  const lineFilter = String(params.line || '').trim().toLowerCase();
  const shiftFilter = String(params.shift || '').trim().toLowerCase();
  const startDate = params.startDate ? new Date(params.startDate) : null;
  const endDate = params.endDate ? new Date(params.endDate) : null;

  return records.filter(function (record) {
    const matchLine = !lineFilter || String(record.line).toLowerCase() === lineFilter;
    const matchShift = !shiftFilter || String(record.shift).toLowerCase() === shiftFilter;

    let matchDate = true;
    if (record.raw_date) {
      const recordDate = new Date(record.raw_date + 'T00:00:00');
      if (startDate && recordDate < startDate) matchDate = false;
      if (endDate && recordDate > endDate) matchDate = false;
    }

    return matchLine && matchShift && matchDate;
  });
}

function aggregateRecords(records) {
  if (!records || records.length === 0) {
    return {
      total_rows: 0,
      total_target_pcs: 0,
      total_good_pcs: 0,
      total_reject_pcs: 0,
      total_production_pcs: 0,
      total_loading_time_min: 0,
      total_trouble_time_min: 0,
      total_operating_time_min: 0,
      average_actual_cycle_time_sec: 0,
      average_ideal_cycle_time_sec: 0,
      availability: 0,
      performance: 0,
      quality: 0,
      oee: 0,
      reject_rate: 0,
      target_achievement: 0
    };
  }

  const totals = records.reduce(function (acc, item) {
    acc.total_target_pcs += item.target_pcs;
    acc.total_good_pcs += item.good_pcs;
    acc.total_reject_pcs += item.reject_pcs;
    acc.total_production_pcs += item.total_pcs;
    acc.total_loading_time_min += item.loading_time_min;
    acc.total_trouble_time_min += item.trouble_time_min;
    acc.total_operating_time_min += item.operating_time_min;
    acc.totalIdealCycleContribution += item.ideal_cycle_time_sec * item.total_pcs;
    return acc;
  }, {
    total_target_pcs: 0,
    total_good_pcs: 0,
    total_reject_pcs: 0,
    total_production_pcs: 0,
    total_loading_time_min: 0,
    total_trouble_time_min: 0,
    total_operating_time_min: 0,
    totalIdealCycleContribution: 0
  });

  const availability = totals.total_loading_time_min > 0
    ? totals.total_operating_time_min / totals.total_loading_time_min
    : 0;

  const performanceRaw = (totals.total_operating_time_min > 0 && totals.total_production_pcs > 0)
    ? totals.totalIdealCycleContribution / (totals.total_operating_time_min * 60)
    : 0;

  const performance = clamp(performanceRaw, 0, 1);
  const quality = totals.total_production_pcs > 0
    ? totals.total_good_pcs / totals.total_production_pcs
    : 0;

  const oee = availability * performance * quality;
  const avgActualCycle = (totals.total_operating_time_min > 0 && totals.total_production_pcs > 0)
    ? (totals.total_operating_time_min * 60) / totals.total_production_pcs
    : 0;
  const avgIdealCycle = totals.total_production_pcs > 0
    ? totals.totalIdealCycleContribution / totals.total_production_pcs
    : 0;

  return {
    total_rows: records.length,
    total_target_pcs: round2(totals.total_target_pcs),
    total_good_pcs: round2(totals.total_good_pcs),
    total_reject_pcs: round2(totals.total_reject_pcs),
    total_production_pcs: round2(totals.total_production_pcs),
    total_loading_time_min: round2(totals.total_loading_time_min),
    total_trouble_time_min: round2(totals.total_trouble_time_min),
    total_operating_time_min: round2(totals.total_operating_time_min),
    average_actual_cycle_time_sec: round2(avgActualCycle),
    average_ideal_cycle_time_sec: round2(avgIdealCycle),
    availability: round4(availability),
    performance: round4(performance),
    performance_raw: round4(performanceRaw),
    quality: round4(quality),
    oee: round4(oee),
    reject_rate: totals.total_production_pcs > 0 ? round4(totals.total_reject_pcs / totals.total_production_pcs) : 0,
    target_achievement: totals.total_target_pcs > 0 ? round4(totals.total_production_pcs / totals.total_target_pcs) : 0
  };
}

function groupAndAggregate(records, key) {
  const groups = {};

  records.forEach(function (item) {
    const groupKey = String(item[key] || 'Unknown');
    if (!groups[groupKey]) groups[groupKey] = [];
    groups[groupKey].push(item);
  });

  return Object.keys(groups)
    .sort()
    .map(function (groupKey) {
      return {
        key: groupKey,
        summary: aggregateRecords(groups[groupKey])
      };
    });
}

function startDummy(params) {
  const current = getDummyState();
  const next = normalizeDummyState(mergeObjects(current, params || {}));
  next.running = true;
  next.started_at = formatDateTime(new Date());
  saveDummyState(next);

  return {
    success: true,
    message: 'Dummy mode aktif.',
    dummy: next,
    dashboard: buildDashboardResponse({})
  };
}

function stopDummy() {
  const current = getDummyState();
  current.running = false;
  current.stopped_at = formatDateTime(new Date());
  saveDummyState(current);

  return {
    success: true,
    message: 'Dummy mode berhenti.',
    dummy: current,
    dashboard: buildDashboardResponse({})
  };
}

function runDummyTick(params) {
  const current = getDummyState();
  const merged = normalizeDummyState(mergeObjects(current, params || {}));
  const isForced = toBoolean(params.force);

  if (!merged.running && !isForced) {
    return {
      success: false,
      message: 'Dummy mode belum aktif.',
      dummy: merged
    };
  }

  const generated = generateDummyPayload(merged);
  const writeResult = appendSheetRow(generated);
  const normalizedWritten = normalizeRecord(rowToObject(writeResult.headers, writeResult.row_values, writeResult.row_number));

  merged.running = merged.running || isForced;
  merged.sequence = toNumber(merged.sequence) + 1;
  merged.last_generated_at = formatDateTime(new Date());
  merged.last_written_row = writeResult.row_number;
  saveDummyState(merged);

  return {
    success: true,
    message: 'Dummy tick berhasil ditulis ke sheet.',
    dummy: merged,
    row: normalizedWritten,
    dashboard: buildDashboardResponse({})
  };
}

function appendManualRecord(params) {
  const payload = {
    tanggal: params.tanggal ? new Date(params.tanggal) : new Date(),
    line: String(params.line || 'Manual').trim(),
    shift: String(params.shift || '-').trim(),
    target_pcs: toNumber(params.target_pcs),
    good_pcs: toNumber(params.good_pcs),
    reject_pcs: toNumber(params.reject_pcs),
    total_pcs: toNumber(params.total_pcs) || (toNumber(params.good_pcs) + toNumber(params.reject_pcs)),
    loading_time_min: toNumber(params.loading_time_min),
    trouble_time_min: toNumber(params.trouble_time_min),
    ideal_cycle_time_sec: toNumber(params.ideal_cycle_time_sec),
    updated_at: new Date(),
    source: String(params.source || 'MANUAL_API').trim()
  };

  const writeResult = appendSheetRow(payload);
  const normalizedWritten = normalizeRecord(rowToObject(writeResult.headers, writeResult.row_values, writeResult.row_number));

  return {
    success: true,
    message: 'Record berhasil ditambahkan ke sheet.',
    row: normalizedWritten,
    dashboard: buildDashboardResponse({})
  };
}

function appendSheetRow(payload) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const sheet = getSheet();
    const headers = ensureSheetHeaders(sheet);
    const rowValues = headers.map(function (header) {
      return valueForSheetHeader(header, payload);
    });

    const nextRow = sheet.getLastRow() + 1;
    sheet.getRange(nextRow, 1, 1, rowValues.length).setValues([rowValues]);

    return {
      row_number: nextRow,
      headers: headers,
      row_values: rowValues
    };
  } finally {
    lock.releaseLock();
  }
}

function valueForSheetHeader(header, payload) {
  const canonicalField = getCanonicalFieldForHeader(header);

  switch (canonicalField) {
    case 'tanggal':
      return payload.tanggal || new Date();
    case 'line':
      return payload.line || 'Unknown';
    case 'shift':
      return payload.shift || '-';
    case 'target_pcs':
      return toNumber(payload.target_pcs);
    case 'good_pcs':
      return toNumber(payload.good_pcs);
    case 'reject_pcs':
      return toNumber(payload.reject_pcs);
    case 'total_pcs':
      return toNumber(payload.total_pcs) || (toNumber(payload.good_pcs) + toNumber(payload.reject_pcs));
    case 'loading_time_min':
      return toNumber(payload.loading_time_min);
    case 'trouble_time_min':
      return toNumber(payload.trouble_time_min);
    case 'ideal_cycle_time_sec':
      return toNumber(payload.ideal_cycle_time_sec);
    case 'updated_at':
      return payload.updated_at || new Date();
    case 'source':
      return payload.source || 'API';
    default:
      return payload[header] || '';
  }
}

function getCanonicalFieldForHeader(header) {
  const normalized = normalizeKey(header);
  const fieldNames = Object.keys(FIELD_ALIASES);

  for (var i = 0; i < fieldNames.length; i += 1) {
    const canonical = fieldNames[i];
    const aliases = FIELD_ALIASES[canonical];
    const match = aliases.some(function (alias) {
      return normalizeKey(alias) === normalized;
    });
    if (match) return canonical;
  }

  return '';
}

function generateDummyPayload(state) {
  const now = new Date();
  const loadingTimeMin = Math.max(1, toNumber(state.loading_time_min) || 480);
  const maxTrouble = Math.max(0, Math.min(loadingTimeMin - 1, toNumber(state.trouble_time_max_min) || 30));
  const troubleTimeMin = maxTrouble > 0 ? randomInt(0, maxTrouble) : 0;
  const operatingTimeMin = Math.max(loadingTimeMin - troubleTimeMin, 1);
  const idealCycleTimeSec = Math.max(1, toNumber(state.ideal_cycle_time_sec) || 24);
  const theoreticalOutput = Math.max(1, Math.round((operatingTimeMin * 60) / idealCycleTimeSec));

  const performanceFactor = randomNumber(0.82, 1.02);
  const qualityFactor = randomNumber(0.94, 0.995);
  const targetPcs = Math.max(1, toNumber(state.target_pcs) || theoreticalOutput);

  const totalPcs = Math.max(1, Math.round(Math.min(theoreticalOutput * performanceFactor, targetPcs * 1.15)));
  const goodPcs = Math.max(0, Math.min(totalPcs, Math.round(totalPcs * qualityFactor)));
  const rejectPcs = Math.max(0, totalPcs - goodPcs);

  return {
    tanggal: now,
    line: String(state.line || 'Line A').trim(),
    shift: String(state.shift || '1').trim(),
    target_pcs: targetPcs,
    good_pcs: goodPcs,
    reject_pcs: rejectPcs,
    total_pcs: totalPcs,
    loading_time_min: loadingTimeMin,
    trouble_time_min: troubleTimeMin,
    ideal_cycle_time_sec: idealCycleTimeSec,
    updated_at: now,
    source: 'DUMMY_DASHBOARD'
  };
}

function getDummyState() {
  const properties = PropertiesService.getScriptProperties();
  const raw = properties.getProperty(CONFIG.DUMMY_STATE_KEY);

  if (!raw) {
    return normalizeDummyState(CONFIG.DEFAULT_DUMMY_STATE);
  }

  try {
    const parsed = JSON.parse(raw);
    return normalizeDummyState(parsed);
  } catch (error) {
    return normalizeDummyState(CONFIG.DEFAULT_DUMMY_STATE);
  }
}

function saveDummyState(state) {
  const normalized = normalizeDummyState(state);
  PropertiesService.getScriptProperties().setProperty(CONFIG.DUMMY_STATE_KEY, JSON.stringify(normalized));
  return normalized;
}

function normalizeDummyState(state) {
  const base = mergeObjects(CONFIG.DEFAULT_DUMMY_STATE, state || {});
  return {
    running: toBoolean(base.running),
    line: String(base.line || CONFIG.DEFAULT_DUMMY_STATE.line).trim(),
    shift: String(base.shift || CONFIG.DEFAULT_DUMMY_STATE.shift).trim(),
    target_pcs: Math.max(1, round2(toNumber(base.target_pcs) || CONFIG.DEFAULT_DUMMY_STATE.target_pcs)),
    loading_time_min: Math.max(1, round2(toNumber(base.loading_time_min) || CONFIG.DEFAULT_DUMMY_STATE.loading_time_min)),
    trouble_time_max_min: Math.max(0, round2(toNumber(base.trouble_time_max_min || base.trouble_time_min) || CONFIG.DEFAULT_DUMMY_STATE.trouble_time_max_min)),
    ideal_cycle_time_sec: Math.max(1, round2(toNumber(base.ideal_cycle_time_sec) || CONFIG.DEFAULT_DUMMY_STATE.ideal_cycle_time_sec)),
    interval_sec: Math.max(3, Math.round(toNumber(base.interval_sec) || CONFIG.DEFAULT_DUMMY_STATE.interval_sec)),
    sequence: Math.max(0, Math.round(toNumber(base.sequence))),
    last_generated_at: String(base.last_generated_at || ''),
    last_written_row: Math.max(0, Math.round(toNumber(base.last_written_row))),
    started_at: String(base.started_at || ''),
    stopped_at: String(base.stopped_at || '')
  };
}

function pickValue(row, aliases) {
  const normalizedMap = {};

  Object.keys(row).forEach(function (key) {
    normalizedMap[normalizeKey(key)] = row[key];
  });

  for (var i = 0; i < aliases.length; i += 1) {
    const found = normalizedMap[normalizeKey(aliases[i])];
    if (found !== '' && found !== null && typeof found !== 'undefined') {
      return found;
    }
  }

  return '';
}

function normalizeKey(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function toNumber(value) {
  if (typeof value === 'number') return value;
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (value === null || typeof value === 'undefined' || value === '') return 0;

  const normalized = String(value)
    .replace(/\./g, '')
    .replace(',', '.')
    .replace(/[^0-9.-]/g, '');

  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? 0 : parsed;
}

function toBoolean(value) {
  if (typeof value === 'boolean') return value;
  const normalized = String(value || '').trim().toLowerCase();
  return ['true', '1', 'yes', 'y', 'on'].indexOf(normalized) > -1;
}

function normalizeDateValue(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value)) {
    return Utilities.formatDate(value, CONFIG.TIMEZONE, 'yyyy-MM-dd');
  }

  const asDate = new Date(value);
  if (!isNaN(asDate)) {
    return Utilities.formatDate(asDate, CONFIG.TIMEZONE, 'yyyy-MM-dd');
  }

  return '';
}

function formatDateKey(value) {
  const normalized = normalizeDateValue(value);
  return normalized || '-';
}

function formatDateLabel(value) {
  const normalized = normalizeDateValue(value);
  if (!normalized) return '-';

  const asDate = new Date(normalized + 'T00:00:00');
  return Utilities.formatDate(asDate, CONFIG.TIMEZONE, 'dd MMM yyyy');
}

function formatDateTime(value) {
  return Utilities.formatDate(value, CONFIG.TIMEZONE, 'yyyy-MM-dd HH:mm:ss');
}

function sanitizeEvent(e) {
  return {
    parameter: e && e.parameter ? e.parameter : {},
    parameters: e && e.parameters ? e.parameters : {},
    queryString: e && e.queryString ? e.queryString : '',
    postData: e && e.postData ? {
      type: e.postData.type,
      length: e.postData.length,
      contents: e.postData.contents,
      name: e.postData.name
    } : null
  };
}

function mergeObjects() {
  const output = {};

  for (var i = 0; i < arguments.length; i += 1) {
    const obj = arguments[i] || {};
    Object.keys(obj).forEach(function (key) {
      output[key] = obj[key];
    });
  }

  return output;
}

function randomInt(min, max) {
  const safeMin = Math.ceil(Math.min(min, max));
  const safeMax = Math.floor(Math.max(min, max));
  return Math.floor(Math.random() * (safeMax - safeMin + 1)) + safeMin;
}

function randomNumber(min, max) {
  return Math.random() * (max - min) + min;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function round2(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function round4(value) {
  return Math.round((value + Number.EPSILON) * 10000) / 10000;
}
