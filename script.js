let array = [];
let comparisons = 0;
let delay = 50;
let sortedSet = new Set();

function getSpeed() {
  return 105 - parseInt(document.getElementById("speed").value);
}

function generateArray() {
  const size = parseInt(document.getElementById("size").value);
  array = Array.from({ length: size }, () => Math.floor(Math.random() * 200) + 5);
  comparisons = 0;
  sortedSet.clear();
  updateDisplay();
  document.getElementById("comparisons").textContent = 0;
  document.getElementById("complexity").textContent = "-";
}

function updateDisplay(highlight = {}) {
  const container = document.getElementById("array-container");
  container.innerHTML = "";

  array.forEach((value, idx) => {
    const bar = document.createElement("div");
    bar.classList.add("bar");
    bar.style.height = `${value}px`;
    bar.style.width = `${600 / array.length}px`;

    if (sortedSet.has(idx)) {
      bar.style.backgroundColor = "green";
    } else {
      bar.style.backgroundColor = highlight[idx] || "blue";
    }

    container.appendChild(bar);
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function visualize(i, j, type) {
  const colorMap = {};
  if (type === "compare") {
    colorMap[i] = "yellow";
    colorMap[j] = "yellow";
  } else if (type === "swap") {
    colorMap[i] = "red";
    colorMap[j] = "red";
  }
  updateDisplay(colorMap);
  await sleep(delay);
}

async function sort() {
  delay = getSpeed();
  const algo = document.getElementById("algorithm").value;
  comparisons = 0;
  sortedSet.clear();

  switch (algo) {
    case "bubble": await bubbleSort(); setComplexity("O(n²)"); break;
    case "selection": await selectionSort(); setComplexity("O(n²)"); break;
    case "insertion": await insertionSort(); setComplexity("O(n²)"); break;
    case "counting": await countingSort(); setComplexity("O(n + k)"); break;
    case "radix": await radixSort(); setComplexity("O(nk)"); break;
    case "bucket": await bucketSort(); setComplexity("O(n + k)"); break;
    case "merge": await mergeSort(0, array.length - 1); setComplexity("O(n log n)"); break;
    case "quick": await quickSort(0, array.length - 1); setComplexity("O(n log n)"); break;
  }

  // Mark all bars green if not already
  array.forEach((_, i) => sortedSet.add(i));
  updateDisplay();
  document.getElementById("comparisons").textContent = comparisons;
}

function setComplexity(text) {
  document.getElementById("complexity").textContent = text;
}

// -------- Sorting Algorithms --------

async function bubbleSort() {
  let n = array.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      comparisons++;
      await visualize(j, j + 1, "compare");

      if (array[j] > array[j + 1]) {
        await visualize(j, j + 1, "swap");
        [array[j], array[j + 1]] = [array[j + 1], array[j]];
      }

      updateDisplay();
      await sleep(delay);
    }
    sortedSet.add(n - i - 1);
    updateDisplay();
    await sleep(delay);
  }
  sortedSet.add(0);
}

async function selectionSort() {
  let n = array.length;
  for (let i = 0; i < n; i++) {
    let min = i;
    for (let j = i + 1; j < n; j++) {
      comparisons++;
      await visualize(min, j, "compare");
      if (array[j] < array[min]) {
        min = j;
      }
    }
    if (min !== i) {
      await visualize(i, min, "swap");
      [array[i], array[min]] = [array[min], array[i]];
    }
    sortedSet.add(i);
    updateDisplay();
    await sleep(delay);
  }
}

async function insertionSort() {
  let n = array.length;
  for (let i = 1; i < n; i++) {
    let key = array[i];
    let j = i - 1;
    while (j >= 0 && array[j] > key) {
      comparisons++;
      await visualize(j, j + 1, "compare");
      array[j + 1] = array[j];
      j--;
      updateDisplay();
      await sleep(delay);
    }
    array[j + 1] = key;
    sortedSet.add(j + 1);
    updateDisplay();
    await sleep(delay);
  }
  array.forEach((_, i) => sortedSet.add(i));
}

async function countingSort() {
  let max = Math.max(...array);
  let count = Array(max + 1).fill(0);

  for (let i = 0; i < array.length; i++) {
    count[array[i]]++;
    comparisons++;
    await visualize(i, i, "compare");
  }

  let index = 0;
  for (let i = 0; i < count.length; i++) {
    while (count[i]-- > 0) {
      array[index] = i;
      sortedSet.add(index);
      updateDisplay();
      await sleep(delay);
      index++;
    }
  }
}

async function radixSort() {
  let max = Math.max(...array);
  let exp = 1;
  while (Math.floor(max / exp) > 0) {
    await countingRadix(exp);
    exp *= 10;
  }
  array.forEach((_, i) => sortedSet.add(i));
}

async function countingRadix(exp) {
  let output = new Array(array.length);
  let count = new Array(10).fill(0);

  for (let i = 0; i < array.length; i++) {
    count[Math.floor(array[i] / exp) % 10]++;
    comparisons++;
    await visualize(i, i, "compare");
  }

  for (let i = 1; i < 10; i++) count[i] += count[i - 1];

  for (let i = array.length - 1; i >= 0; i--) {
    let digit = Math.floor(array[i] / exp) % 10;
    output[--count[digit]] = array[i];
  }

  for (let i = 0; i < array.length; i++) {
    array[i] = output[i];
    sortedSet.add(i);
    updateDisplay();
    await sleep(delay);
  }
}

async function bucketSort() {
  let buckets = Array.from({ length: 10 }, () => []);

  for (let i = 0; i < array.length; i++) {
    let index = Math.floor(array[i] / 20);
    buckets[index].push(array[i]);
    comparisons++;
    await visualize(i, i, "compare");
  }

  array = [];
  for (let b of buckets) {
    b.sort((a, b) => a - b);
    array = array.concat(b);
  }

  for (let i = 0; i < array.length; i++) {
    sortedSet.add(i);
    updateDisplay();
    await sleep(delay);
  }
}

async function mergeSort(left, right) {
  if (left >= right) return;
  let mid = Math.floor((left + right) / 2);
  await mergeSort(left, mid);
  await mergeSort(mid + 1, right);
  await merge(left, mid, right);
}

async function merge(left, mid, right) {
  let leftArr = array.slice(left, mid + 1);
  let rightArr = array.slice(mid + 1, right + 1);
  let i = 0, j = 0, k = left;

  while (i < leftArr.length && j < rightArr.length) {
    comparisons++;
    await visualize(k, k, "compare");

    if (leftArr[i] <= rightArr[j]) {
      array[k] = leftArr[i++];
    } else {
      array[k] = rightArr[j++];
    }

    sortedSet.add(k);
    updateDisplay();
    await sleep(delay);
    k++;
  }

  while (i < leftArr.length) {
    array[k] = leftArr[i++];
    sortedSet.add(k);
    updateDisplay();
    await sleep(delay);
    k++;
  }

  while (j < rightArr.length) {
    array[k] = rightArr[j++];
    sortedSet.add(k);
    updateDisplay();
    await sleep(delay);
    k++;
  }
}

async function quickSort(low, high) {
  if (low < high) {
    const pi = await partition(low, high);
    sortedSet.add(pi);
    updateDisplay();
    await quickSort(low, pi - 1);
    await quickSort(pi + 1, high);
  } else if (low === high) {
    sortedSet.add(low);
    updateDisplay();
  }
}

async function partition(low, high) {
  let pivot = array[high];
  let i = low - 1;

  for (let j = low; j < high; j++) {
    comparisons++;
    await visualize(j, high, "compare");

    if (array[j] < pivot) {
      i++;
      [array[i], array[j]] = [array[j], array[i]];
      await visualize(i, j, "swap");
      updateDisplay();
      await sleep(delay);
    }
  }

  [array[i + 1], array[high]] = [array[high], array[i + 1]];
  await visualize(i + 1, high, "swap");
  await sleep(delay);
  return i + 1;
}
