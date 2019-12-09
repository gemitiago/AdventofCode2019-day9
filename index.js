const fs = require('fs');
let input = fs.readFileSync('./input.txt').toString();
input = input.split(',').map(n => Number(n));

const ParamMode = Object.freeze({ position: '0', immediate: '1', relative: '2' });

const nextInstIndex = (instIndex, diagProg) => {
  let res = instIndex;
  const inst = diagProg[instIndex].toString().padStart(5, '0');
  const opCode = inst[3].toString() + inst[4].toString();

  if (opCode === '01' || opCode === '02' || opCode === '07' || opCode === '08') {
    res += 4;
  } else if (opCode === '03' || opCode === '04' || opCode === '09') {
    res += 2;
  } else if (opCode === '05' || opCode === '06') {
    res += 3;
  }

  return res;
};

const undefinedToZero = val => {
  return val === undefined ? 0 : val;
};

const calcIndexWithParamMode = (modeParam, positionArgValue, immediateArgValue, relativeBase, diagProg) => {
  switch (modeParam) {
    case ParamMode.position:
      return positionArgValue;
    case ParamMode.immediate:
      return immediateArgValue;
    case ParamMode.relative:
      return relativeBase + diagProg[immediateArgValue];
    default:
      break;
  }
};

const runOpCode = (instIndex, diagProg, arrayInputInst, logOutputsYN = true, relativeBase = 0) => {
  const inst = diagProg[instIndex].toString().padStart(5, '0');
  const opCode = inst[3].toString() + inst[4].toString();
  const modeFirstParam = inst[2].toString();
  const modeSecondParam = inst[1].toString();
  const modeThirdParam = inst[0].toString();

  let jumpToIndex = null;
  let output = null;

  if (opCode === '99') {
    return { success: false, jumpToIndex: jumpToIndex, output: output, relativeBase: relativeBase };
  } else {
    const auxArg1 = diagProg[instIndex + 1];
    const indexArg1 = undefinedToZero(
      calcIndexWithParamMode(modeFirstParam, auxArg1, instIndex + 1, relativeBase, diagProg)
    );
    const arg1 = diagProg[indexArg1];
    const auxArg2 = diagProg[instIndex + 2];
    const arg2 =
      diagProg[
        undefinedToZero(calcIndexWithParamMode(modeSecondParam, auxArg2, instIndex + 2, relativeBase, diagProg))
      ];
    const auxindexArg3 = diagProg[instIndex + 3];
    const indexArg3 = undefinedToZero(
      calcIndexWithParamMode(modeThirdParam, auxindexArg3, instIndex + 3, relativeBase, diagProg)
    );

    if (opCode === '01' || opCode === '02' || opCode === '03' || opCode === '07' || opCode === '08') {
      if (indexArg3 < 0) {
        //console.log('indexArg3:' + indexArg3);
        return { success: false, jumpToIndex: null, output: null, relativeBase: relativeBase };
      }
    }

    switch (opCode) {
      case '01':
        diagProg[indexArg3] = arg1 + arg2;
        break;
      case '02':
        diagProg[indexArg3] = arg1 * arg2;
        break;
      case '03':
        diagProg[indexArg1] = arrayInputInst[0];
        arrayInputInst.length > 1 && arrayInputInst.shift();
        break;
      case '04':
        logOutputsYN && console.log(arg1);
        output = arg1;
        break;
      case '05':
        jumpToIndex = arg1 !== 0 ? arg2 : null;
        break;
      case '06':
        jumpToIndex = arg1 === 0 ? arg2 : null;
        break;
      case '07':
        diagProg[indexArg3] = arg1 < arg2 ? 1 : 0;
        break;
      case '08':
        diagProg[indexArg3] = arg1 === arg2 ? 1 : 0;
        break;
      case '09':
        relativeBase += arg1;
        break;
      default:
        break;
    }
  }

  if (jumpToIndex < 0) {
    return { success: false, jumpToIndex: jumpToIndex, output: null, relativeBase: relativeBase };
  } else {
    return { success: true, jumpToIndex: jumpToIndex, output: output, relativeBase: relativeBase };
  }
};

const runProgram = (arrayInputInst, diagProg, isPart2 = false, instIndex = 0) => {
  let auxProg = [...diagProg];
  let executeOpCode = {};
  let output = null;
  let relativeBase = 0;
  let listOutputs = [];
  let isWaitingInst = 0;

  while (true) {
    executeOpCode = runOpCode(instIndex, auxProg, arrayInputInst, false, relativeBase);
    relativeBase = executeOpCode.relativeBase;

    if (!executeOpCode.success) {
      break;
    }

    if (executeOpCode.output !== null) {
      output = executeOpCode.output;
      listOutputs.push(output);
      if (isPart2) {
        break;
      }
    }

    const jumpToIndex = executeOpCode.jumpToIndex;

    if (jumpToIndex === null) {
      instIndex = nextInstIndex(instIndex, auxProg);
    } else {
      instIndex = jumpToIndex;
    }
  }
  auxProg = auxProg.map(i => undefinedToZero(i));
  return {
    output: listOutputs,
    prog: auxProg,
    exit: !executeOpCode.success,
    isWaitingInst: isWaitingInst,
    relativeBase: relativeBase
  };
};

console.time('part1');
console.log(runProgram([1], input).output);
console.timeEnd('part1');
console.time('part2');
console.log(runProgram([2], input).output);
console.timeEnd('part2');


