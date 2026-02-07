import React from "react";
import "./DataTable.css";
import { groupBy, safeToFixed } from "../utils/utils";

const DataTable = ({ data }) => {

    const groupData = (data) => {
        // Группировка по corporate_person и их сортировка по алфавиту
        const groupedByCorporate = groupBy(data, "corporate_person", "Без категории");
        const sortedCorporate = Object.keys(groupedByCorporate).sort();

        const result = [];

        sortedCorporate.forEach((corporate) => {
            const corporateItems = groupedByCorporate[corporate];

            // Добавляем заголовок группы corporate_person
            result.push({
                type: "corporate_person",
                name: corporate,
                items: corporateItems
            });

            // Сортировка, игнорирующая начальные спецсимволы
            const sortedCorporateItems = [...corporateItems].sort((a, b) => {
                const getSortKey = (str) => {
                    if (!str) return "";
                    // Убираем всё до первой буквы
                    const match = str.match(/[а-яА-Яa-zA-Z].*/);
                    return match ? match[0] : str;
                };
                
                const keyA = getSortKey(a.client_name || "");
                const keyB = getSortKey(b.client_name || "");
                return keyA.localeCompare(keyB, 'ru');
            });

            // Добавляем все элементы группы
            sortedCorporateItems.forEach((item) => {
                result.push({
                    type: "item",
                    data: item
                });
            });

            // Вычисляем общие суммы для corporate_person
            const corporateVolumeConcrete = corporateItems.reduce((sum, item) => sum + (Number(item.volume_concrete) || 0), 0);
            const corporateVolumeMortar = corporateItems.reduce((sum, item) => sum + (Number(item.volume_mortar) || 0), 0);
            
            // Вычисляем сумму сумм (volume_concrete + volume_mortar)
            const sumOfSums = corporateVolumeConcrete + corporateVolumeMortar;

            // Добавляем итог по volume_concrete + volume_mortar
            result.push({
                type: "corporate_total",
                volume_concrete: corporateVolumeConcrete,
                volume_mortar: corporateVolumeMortar,
            });
            
            // Добавляем сумму сумм отдельной строкой
            result.push({
                type: "sum_of_sums",
                value: sumOfSums
            });
        });

        return result;
    };

    const flattenedData = groupData(data);

    // console.log(flattenedData)

    const renderRow = (row, rowIndex) => {
        switch (row.type) {
            case "corporate_person":
                return (
                    <tr key={`corporate_person-${row.name}-${rowIndex}`} className="corporate_person-row">
                        <td className="group-title" colSpan="15">{`Заявки ${row.name}`}</td>
                    </tr>
                );

            case "corporate_total":
                return (
                    <tr key={`corporate-total-${rowIndex}`} className="corporate-total">
                        <td></td>
                        <td className="total-volume-concrete">{safeToFixed(row.volume_concrete)}</td>
                        <td className="total-volume-mortar">{safeToFixed(row.volume_mortar)}</td>
                        <td colSpan="12"></td>
                    </tr>
                );
                
            case "sum_of_sums":
                return (
                    <tr key={`sum-of-sums-${rowIndex}`} className="sum-of-sums-row">
                        <td className="sum-label"></td>
                        <td className="sum-of-sums-value" colSpan="2">{safeToFixed(row.value)}</td>
                        <td colSpan="12"></td>
                    </tr>
                );

            case "item":
                const item = row.data;
                const uniqueKey = `item-${item.id}-${rowIndex}`;

                // Форматирование unloading_method
                let unloadingMethodFormatted = "-";
                if (item.unloading_method && Array.isArray(item.unloading_method)) {
                    unloadingMethodFormatted = item.unloading_method.join(", ");
                } else if (item.unloading_method) {
                    unloadingMethodFormatted = item.unloading_method;
                }

                return (
                    <tr key={uniqueKey} className="detail-row">
                        <td>{item.client_name || "-"}</td>
                        <td>{safeToFixed(item.volume_concrete)}</td>
                        <td>{safeToFixed(item.volume_mortar)}</td>
                        <td>{item.class || "-"}</td>
                        <td>{item.filler_client || "-"}</td>
                        <td>{item.mobility || "-"}</td>
                        <td>{item.waterproofness || "-"}</td>
                        <td>{item.frost_resistance || "-"}</td>
                        <td>{item.additions_chemical || "-"}</td>
                        <td>{item.min_timestamp_target || "-"}</td>
                        <td>{item.all_timestamps_formatted || "-"}</td>
                        <td>{unloadingMethodFormatted}</td>
                        <td>{item.address || "-"}</td>
                        <td>{(item.responsible_person_name) || "-"}</td>
                        <td>{item.fillers_production || "-"}</td>
                    </tr>
                );

            default:
                return null;
        }
    };

    return (
        <div className="data-table-container">
            <table className="data-table">
                <thead>
                    <tr className="data-table-head">
                        <th>Клиент</th>
                        <th>Бетон</th>
                        <th>Раствор</th>
                        <th>Класс</th>
                        <th>Заполнитель</th>
                        <th>Подвижность</th>
                        <th>W</th>
                        <th>F</th>
                        <th>Добавки</th>
                        <th>Время</th>
                        <th>Интервал</th>
                        <th>Разгрузка</th>
                        <th>Адрес</th>
                        <th>Ответственные</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {flattenedData.map((row, index) => renderRow(row, index))}
                </tbody>
            </table>
        </div>
    );
};

export default DataTable;