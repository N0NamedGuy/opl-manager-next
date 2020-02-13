const scales = [
    { label: 'B', factor: 1 },
    { label: 'Kb', factor: 1024 },
    { label: 'Mb', factor: 1024 * 1024 },
    { label: 'Gb', factor: 1024 * 1024 * 1024 },
    { label: 'Tb', factor: 1024 * 1024 * 1024 * 1024 },
    { label: 'Pb', factor: 1024 * 1024 * 1024 * 1024 * 1024 },
];

function humanSize(size) {
    const scale = scales.find(
        scale => size > scale.factor
    ) || scales[scales.length - 1];

    return `${size / scale.factor} ${scale.label}`
}

export default humanSize;