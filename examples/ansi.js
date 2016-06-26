'use strict'

/**
 * adonis-ace
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
*/

const Command = require('../src/Command')
const c = new Command()

c.table(['Name', 'Status'], {'1420019201_User': 'N', '10200202': 'Y'})
c.table(['Name', 'Status'], [{'1420019201_User': 'N'}, {'10200202': 'Y'}])
c.table(['Name', 'Age'], [['Virk', 22]])
