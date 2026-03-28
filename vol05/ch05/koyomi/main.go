package main

import (
	"fmt"
	"log/slog"
	"time"

	"example.com/koyomi/internal/gen/example/koyomi/convert"
	"github.com/goark/koyomi/value"
	"go.bytecodealliance.org/cm"
)

var (
	westernDates = map[cm.Rep]value.DateJp{}
	warekiDates  = map[cm.Rep]value.DateJp{}
	repCounter   cm.Rep
)

func newRep() cm.Rep {
	repCounter++
	return repCounter
}

func westernDateConstructor(year uint16, month uint8, day uint8) convert.WesternDate {
	t := time.Date(int(year), time.Month(month), int(day), 0, 0, 0, 0, value.JST)
	d := value.NewDate(t)
	rep := newRep()
	westernDates[rep] = d
	slog.Debug("created western date", "rep", rep)
	return convert.WesternDateResourceNew(rep)
}

func westernDateDestructor(self cm.Rep) {
	slog.Debug("destroyed western date", "rep", self)
	delete(westernDates, self)
}

func westernDateToString(self cm.Rep) string {
	return westernDates[self].Format("2006-01-02")
}

func westernDateToWareki(self cm.Rep) cm.Result[string, convert.WarekiDate, string] {
	d := westernDates[self]
	era, _ := d.YearEraString()
	if era == "" {
		return cm.Err[cm.Result[string, convert.WarekiDate, string]](
			fmt.Sprintf("unsupported date: %s", d.Format("2006-01-02")),
		)
	}
	rep := newRep()
	warekiDates[rep] = d
	return cm.OK[cm.Result[string, convert.WarekiDate, string]](
		convert.WarekiDateResourceNew(rep),
	)
}

func warekiDateConstructor(era string, year uint16, month uint8, day uint8) convert.WarekiDate {
	d := value.NewDateEra(value.EraName(era), int(year), time.Month(month), int(day))
	rep := newRep()
	warekiDates[rep] = d
	slog.Debug("created wareki date", "rep", rep)
	return convert.WarekiDateResourceNew(rep)
}

func warekiDateDestructor(self cm.Rep) {
	slog.Debug("destroyed wareki date", "rep", self)
	delete(warekiDates, self)
}

func warekiDateToString(self cm.Rep) string {
	d := warekiDates[self]
	era, year := d.YearEraString()
	return fmt.Sprintf("%s%s%d月%d日", era, year, d.Month(), d.Day())
}

func warekiDateToWestern(self cm.Rep) cm.Result[string, convert.WesternDate, string] {
	d := warekiDates[self]
	if d.IsZero() {
		return cm.Err[cm.Result[string, convert.WesternDate, string]]("invalid wareki date")
	}
	rep := newRep()
	westernDates[rep] = d
	return cm.OK[cm.Result[string, convert.WesternDate, string]](
		convert.WesternDateResourceNew(rep),
	)
}
func init() {
	slog.SetLogLoggerLevel(slog.LevelDebug)

	convert.Exports.WesternDate.Constructor = westernDateConstructor
	convert.Exports.WesternDate.Destructor = westernDateDestructor
	convert.Exports.WesternDate.ToString = westernDateToString
	convert.Exports.WesternDate.ToWareki = westernDateToWareki

	convert.Exports.WarekiDate.ExportConstructor = warekiDateConstructor
	convert.Exports.WarekiDate.Destructor = warekiDateDestructor
	convert.Exports.WarekiDate.ToString = warekiDateToString
	convert.Exports.WarekiDate.ToWestern = warekiDateToWestern
}

func main() {}
