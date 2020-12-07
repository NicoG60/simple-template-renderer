const core    = require('@actions/core')
const process = require('process');

function replacer(match, p1) {
    if(!process.env.hasOwnProperty(p1))
        throw new Error(`'${p1}' is not present in env. '${match}' will not be replaced.`)

    return process.env[p1].toString();
}

function render(input, regexp, hard_fail = false) {
    try {
        return input.replace(regexp, replacer)
    }
    catch(err) {
        if(hard_fail)
            throw err
        else
        {
            core.warning(err.message)
            return input
        }
    }
}

module.exports = {
    replacer: replacer,
    render: render
}