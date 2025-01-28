export default (seconds: number) =>
{
    if (seconds < 60)
    {
        return `${seconds} second${seconds === 1 ? "" : "s"}`;
    }

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60)
    {
        return `${minutes} minute${minutes === 1 ? "" : "s"}`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24)
    {
        return `${hours} hour${hours === 1 ? "" : "s"}`;
    }

    const days = Math.floor(hours / 24);
    if (days < 30)
    {
        return `${days} day${days === 1 ? "" : "s"}`;
    }

    const months = Math.floor(days / 30);
    if (months < 12)
    {
        return `${months} month${months === 1 ? "" : "s"}`;
    }

    const years = Math.floor(months / 12);
    return `${years} year${years === 1 ? "" : "s"}`;
};
